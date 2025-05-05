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
    // CRITICAL FIX: Use stronger RTL markers combination
    // \u200F = Right-to-Left Mark (RLM)
    // \u061C = Arabic Letter Mark (ALM)
    return { 
      text: `\u200F${content}`,
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
  // Hebrew text - CRITICAL FIX: Use stronger RTL markers combination
  else if (isHebrewContent) {
    // Use combination of RTL marks for maximum strength
    // \u200F = Right-to-Left Mark (RLM)
    // \u061C = Arabic Letter Mark (ALM)
    // \u200E = Left-to-Right Mark (LRM) - at the end to reset
    return { 
      text: `\u200F\u061C${content}`,
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
