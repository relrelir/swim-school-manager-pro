import { processTableCellText, forceLtrDirection } from '../textDirection';
import { containsHebrew } from '../contentDetection';

/**
 * Process cell text based on content type for optimal table display
 * Enhanced to better handle numeric content
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
  
  // Handle ID numbers - must be LTR with explicit LTR marker
  if (/^\d{5,9}$/.test(content)) {
    return { 
      text: `\u200E${content}`, // Add explicit LTR mark for ID numbers
      isRtl: false,
      isCurrency: false,
      isNumber: true 
    };
  }
  // Phone numbers - must be LTR with explicit LTR marker
  else if (/^0\d{1,2}[\-\s]?\d{7,8}$/.test(content)) {
    return { 
      text: `\u200E${content}`, // Add explicit LTR mark for phone numbers
      isRtl: false,
      isCurrency: false,
      isNumber: true 
    };
  }
  // Pure numbers - must be LTR with explicit LTR marker
  else if (isNumericOnly) {
    return { 
      text: `\u200E${content}`, // Add explicit LTR mark for numbers
      isRtl: false,
      isCurrency: false,
      isNumber: true 
    };
  }
  // Currency with Hebrew text
  else if (isCurrency && isHebrewContent) {
    // Simple RTL mark for Hebrew currency
    return { 
      text: `\u200F${content}`,
      isRtl: true,
      isCurrency: true,
      isNumber: false 
    };
  }
  // Non-Hebrew currency
  else if (isCurrency) {
    return { 
      text: `\u200E${content}`, // Explicit LTR mark for non-Hebrew currency
      isRtl: false,
      isCurrency: true,
      isNumber: false 
    };
  }
  // Date format - always LTR
  else if (/^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(content)) {
    return { 
      text: `\u200E${content}`, // Explicit LTR mark for dates
      isRtl: false,
      isCurrency: false,
      isNumber: false 
    };
  }
  // Hebrew text - simple RTL mark
  else if (isHebrewContent) {
    return { 
      text: `\u200F${content}`, // RLM (Right-to-Left Mark)
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
