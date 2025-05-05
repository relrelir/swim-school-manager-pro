
import { processTableCellText, forceLtrDirection } from '../textDirection';
import { containsHebrew } from '../contentDetection';

/**
 * Process cell text based on content type for optimal table display
 * Enhanced with strong directional embedding controls
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
  
  // Handle ID numbers - must be LTR with strong LTR embedding
  if (/^\d{5,9}$/.test(content)) {
    return { 
      text: `\u202A${content}\u202C`, // LRE + PDF (Left-to-Right Embedding with Pop Directional Formatting)
      isRtl: false,
      isCurrency: false,
      isNumber: true 
    };
  }
  // Phone numbers - must be LTR with strong LTR embedding
  else if (/^0\d{1,2}[\-\s]?\d{7,8}$/.test(content)) {
    return { 
      text: `\u202A${content}\u202C`, // LRE + PDF
      isRtl: false,
      isCurrency: false,
      isNumber: true 
    };
  }
  // Pure numbers - must be LTR with strong LTR embedding
  else if (isNumericOnly) {
    return { 
      text: `\u202A${content}\u202C`, // LRE + PDF
      isRtl: false,
      isCurrency: false,
      isNumber: true 
    };
  }
  // Currency with Hebrew text - use RTL embedding
  else if (isCurrency && isHebrewContent) {
    return { 
      text: `\u202B${content}\u202C`, // RLE + PDF (Right-to-Left Embedding with Pop Directional Formatting)
      isRtl: true,
      isCurrency: true,
      isNumber: false 
    };
  }
  // Non-Hebrew currency - use LTR embedding
  else if (isCurrency) {
    return { 
      text: `\u202A${content}\u202C`, // LRE + PDF
      isRtl: false,
      isCurrency: true,
      isNumber: false 
    };
  }
  // Date format - always LTR with strong embedding
  else if (/^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(content)) {
    return { 
      text: `\u202A${content}\u202C`, // LRE + PDF
      isRtl: false,
      isCurrency: false,
      isNumber: false 
    };
  }
  // Hebrew text - use RTL embedding
  else if (isHebrewContent) {
    return { 
      text: `\u202B${content}\u202C`, // RLE + PDF
      isRtl: true,
      isCurrency: false,
      isNumber: false 
    };
  }
  // Other content (English, etc)
  else {
    return { 
      text: `\u202A${content}\u202C`, // LRE + PDF
      isRtl: false,
      isCurrency: false,
      isNumber: false 
    };
  }
};
