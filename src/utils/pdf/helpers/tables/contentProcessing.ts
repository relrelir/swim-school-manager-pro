
import { processTableCellText, forceLtrDirection } from '../textDirection';
import { containsHebrew } from '../contentDetection';

/**
 * Process cell text based on content type for optimal table display
 * CRITICAL FIX: Use stronger bidirectional isolation markers for Hebrew text
 */
export const processCellContent = (cell: any): { text: string, isRtl: boolean, isCurrency: boolean } => {
  if (cell === null || cell === undefined) {
    return { text: '', isRtl: false, isCurrency: false };
  }
  
  const content = String(cell);
  const isHebrewContent = containsHebrew(content);
  const isCurrency = /[₪$€£]|ILS/.test(content) || /^[\d,\.]+\s*(?:[₪$€£]|ILS)/.test(content);
  
  console.log(`Processing cell: ${content}, Hebrew: ${isHebrewContent}, Currency: ${isCurrency}`);
  
  // Handle participant ID numbers and other numeric IDs
  if (/^\d{5,9}$/.test(content)) {
    // ID numbers need special handling - must be LTR
    return { 
      text: forceLtrDirection(content),
      isRtl: false,
      isCurrency: false 
    };
  }
  // Currency with Hebrew text
  else if (isCurrency && isHebrewContent) {
    // CRITICAL FIX: Use MULTIPLE RTL markers for strongest possible direction enforcement
    // \u202B = Right-to-Left Embedding
    // \u2067 = Right-to-Left Isolate 
    return { 
      text: `\u202B\u2067${content}\u2069\u202C`, // Multiple RTL markers for maximum strength
      isRtl: true,
      isCurrency: true 
    };
  }
  // Non-Hebrew currency
  else if (isCurrency) {
    return { 
      text: forceLtrDirection(content),
      isRtl: false,
      isCurrency: true 
    };
  }
  // Date format - always LTR
  else if (/^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(content)) {
    return { 
      text: forceLtrDirection(content),
      isRtl: false,
      isCurrency: false 
    };
  }
  // Pure numbers
  else if (/^[0-9\s\-\.\/]+$/.test(content)) {
    return { 
      text: forceLtrDirection(content),
      isRtl: false,
      isCurrency: false 
    };
  }
  // Hebrew text - CRITICAL FIX: Use MULTIPLE RTL markers for strongest effect
  else if (isHebrewContent) {
    // Use multiple RTL control characters together for maximum compatibility:
    // \u202B = Right-to-Left Embedding (RLE)
    // \u202E = Right-to-Left Override (RLO) - strongest manual override
    // \u2067 = Right-to-Left Isolate (RLI)
    // \u2069 = Pop Directional Isolate (PDI)
    // \u202C = Pop Directional Formatting (PDF)
    return { 
      text: `\u202B\u202E\u2067${content}\u2069\u202C`, // Multiple markers for strongest RTL effect
      isRtl: true,
      isCurrency: false 
    };
  }
  // Other content (English, etc)
  else {
    return { 
      text: forceLtrDirection(content),
      isRtl: false,
      isCurrency: false 
    };
  }
};
