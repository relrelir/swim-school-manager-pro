import { processTableCellText, forceLtrDirection } from '../textDirection';
import { containsHebrew } from '../contentDetection';

/**
 * Process cell text based on content type for optimal table display
 * Simplified to use fewer control characters
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
      text: content, // Leave IDs as is - the RTL context will be set globally
      isRtl: false,
      isCurrency: false 
    };
  }
  // Currency with Hebrew text
  else if (isCurrency && isHebrewContent) {
    // Simple RTL mark for Hebrew currency
    return { 
      text: `\u200F${content}`,
      isRtl: true,
      isCurrency: true 
    };
  }
  // Non-Hebrew currency
  else if (isCurrency) {
    return { 
      text: content, // Leave as is - RTL context will handle it
      isRtl: false,
      isCurrency: true 
    };
  }
  // Date format - always LTR
  else if (/^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(content)) {
    return { 
      text: content, // Leave as is - RTL context will handle it
      isRtl: false,
      isCurrency: false 
    };
  }
  // Pure numbers
  else if (/^[0-9\s\-\.\/]+$/.test(content)) {
    return { 
      text: content, // Leave as is - RTL context will handle it
      isRtl: false,
      isCurrency: false 
    };
  }
  // Hebrew text - simple RTL mark
  else if (isHebrewContent) {
    return { 
      text: `\u200F${content}`, // RLM (Right-to-Left Mark)
      isRtl: true,
      isCurrency: false 
    };
  }
  // Other content (English, etc)
  else {
    return { 
      text: content, // Leave as is - RTL context will handle it
      isRtl: false,
      isCurrency: false 
    };
  }
};
