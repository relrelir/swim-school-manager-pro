
import { processTableCellText, forceLtrDirection } from '../textDirection';
import { containsHebrew } from '../contentDetection';

/**
 * Process cell text based on content type for optimal table display
 * With stronger direction control for numeric content
 */
export const processCellContent = (cell: any): { text: string, isRtl: boolean, isCurrency: boolean } => {
  if (cell === null || cell === undefined) {
    return { text: '', isRtl: false, isCurrency: false };
  }
  
  const content = String(cell);
  const isHebrewContent = containsHebrew(content);
  const isCurrency = /[₪$€£]|ILS/.test(content) || /^[\d,\.]+\s*(?:[₪$€£]|ILS)/.test(content);
  
  console.log(`Processing cell: ${content}, Hebrew: ${isHebrewContent}, Currency: ${isCurrency}`);
  
  // Handle participant ID numbers and other numeric IDs with strong LTR control
  if (/^\d{5,9}$/.test(content)) {
    // ID numbers need strong LTR embedding
    return { 
      text: `\u202A${content}\u202C`, // LEFT-TO-RIGHT EMBEDDING + POP
      isRtl: false,
      isCurrency: false 
    };
  }
  // Currency with Hebrew text
  else if (isCurrency && isHebrewContent) {
    // Hebrew currency with RTL marker
    return { 
      text: `\u200F${content}`,
      isRtl: true,
      isCurrency: true 
    };
  }
  // Non-Hebrew currency with LTR embedding
  else if (isCurrency) {
    return { 
      text: `\u202A${content}\u202C`, // LEFT-TO-RIGHT EMBEDDING + POP
      isRtl: false,
      isCurrency: true 
    };
  }
  // Date format - always LTR with strong embedding
  else if (/^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(content)) {
    return { 
      text: `\u202A${content}\u202C`, // LEFT-TO-RIGHT EMBEDDING + POP
      isRtl: false,
      isCurrency: false 
    };
  }
  // Pure numbers - strong LTR embedding
  else if (/^[0-9\s\-\.\/]+$/.test(content)) {
    return { 
      text: `\u202A${content}\u202C`, // LEFT-TO-RIGHT EMBEDDING + POP
      isRtl: false,
      isCurrency: false 
    };
  }
  // Hebrew text - RTL mark
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
