
import { processTableCellText, forceLtrDirection } from '../textDirection';
import { containsHebrew } from '../contentDetection';
import { formatPdfField } from '../textFormatting';

/**
 * Process cell text based on content type for optimal table display
 * Using dedicated formatting utilities for proper direction markers
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
    // ID numbers need LTR markers
    return { 
      text: formatPdfField(content, 'number'),
      isRtl: false,
      isCurrency: false 
    };
  }
  // Currency with Hebrew text
  else if (isCurrency && isHebrewContent) {
    return { 
      text: formatPdfField(content, 'number'), // Currency should be LTR
      isRtl: true,
      isCurrency: true 
    };
  }
  // Non-Hebrew currency
  else if (isCurrency) {
    return { 
      text: formatPdfField(content, 'number'), // Currency should be LTR
      isRtl: false,
      isCurrency: true 
    };
  }
  // Date format - always LTR
  else if (/^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(content)) {
    return { 
      text: formatPdfField(content, 'number'),
      isRtl: false,
      isCurrency: false 
    };
  }
  // Pure numbers
  else if (/^[0-9\s\-\.\/]+$/.test(content)) {
    return { 
      text: formatPdfField(content, 'number'),
      isRtl: false,
      isCurrency: false 
    };
  }
  // Hebrew text - use RTL markers
  else if (isHebrewContent) {
    return { 
      text: formatPdfField(content, 'text'), 
      isRtl: true,
      isCurrency: false 
    };
  }
  // Other content (English, etc)
  else {
    return { 
      text: content, // Leave as is
      isRtl: false,
      isCurrency: false 
    };
  }
};
