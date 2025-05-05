
import { processTableCellText, forceLtrDirection } from '../textDirection';
import { containsHebrew } from '../contentDetection';

/**
 * Process cell text based on content type for optimal table display
 * Enhanced to use stronger directional embedding for numeric content
 */
export const processCellContent = (cell: any): { text: string, isRtl: boolean, isCurrency: boolean, isNumber: boolean } => {
  if (cell === null || cell === undefined) {
    return { text: '', isRtl: false, isCurrency: false, isNumber: false };
  }
  
  const content = String(cell);
  const isHebrewContent = containsHebrew(content);
  const isCurrency = /[₪$€£]|ILS/.test(content) || /^[\d,\.]+\s*(?:[₪$€£]|ILS)/.test(content);
  const isNumericOnly = /^[\d\.,\s\-\/]+$/.test(content);
  
  console.log(`Processing cell: ${content}, Hebrew: ${isHebrewContent}, Currency: ${isCurrency}, Numeric: ${isNumericOnly}`);
  
  // Handle ID numbers - must be LTR with explicit LTR embedding
  if (/^\d{5,9}$/.test(content)) {
    return { 
      text: `\u202A${content}\u202C`, // LRE + PDF - stronger than LTR mark
      isRtl: false,
      isCurrency: false,
      isNumber: true 
    };
  }
  // Phone numbers - must be LTR with explicit LTR embedding
  else if (/^0\d{1,2}[\-\s]?\d{7,8}$/.test(content)) {
    return { 
      text: `\u202A${content}\u202C`, // LRE + PDF - stronger than LTR mark
      isRtl: false,
      isCurrency: false,
      isNumber: true 
    };
  }
  // Pure numbers - must be LTR with explicit LTR embedding
  else if (isNumericOnly) {
    return { 
      text: `\u202A${content}\u202C`, // LRE + PDF - stronger than LTR mark
      isRtl: false,
      isCurrency: false,
      isNumber: true 
    };
  }
  // Currency with Hebrew text
  else if (isCurrency && isHebrewContent) {
    // Explicit RTL EMBEDDING for Hebrew currency
    return { 
      text: `\u202B${content}\u202C`, // RLE + PDF - stronger than RTL mark
      isRtl: true,
      isCurrency: true,
      isNumber: false 
    };
  }
  // Non-Hebrew currency
  else if (isCurrency) {
    return { 
      text: `\u202A${content}\u202C`, // LRE + PDF - stronger than LTR mark
      isRtl: false,
      isCurrency: true,
      isNumber: false 
    };
  }
  // Date format - always LTR
  else if (/^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(content)) {
    return { 
      text: `\u202A${content}\u202C`, // LRE + PDF - stronger than LTR mark
      isRtl: false,
      isCurrency: false,
      isNumber: false 
    };
  }
  // Hebrew text - explicit RTL EMBEDDING
  else if (isHebrewContent) {
    return { 
      text: `\u202B${content}\u202C`, // RLE + PDF - stronger than RTL mark
      isRtl: true,
      isCurrency: false,
      isNumber: false 
    };
  }
  // Other content (English, etc)
  else {
    return { 
      text: content, // Leave as is - RTL context will handle it
      isRtl: false,
      isCurrency: false,
      isNumber: false 
    };
  }
};
