
import { processTableCellText, forceLtrDirection, manuallyReverseString } from '../textDirection';
import { containsHebrew } from '../contentDetection';

/**
 * Process cell text based on content type for optimal table display
 * Enhanced to better handle Hebrew text and ID numbers
 */
export const processCellContent = (cell: any): { text: string, isRtl: boolean, isCurrency: boolean } => {
  if (cell === null || cell === undefined) {
    return { text: '', isRtl: false, isCurrency: false };
  }
  
  const content = String(cell);
  const isHebrewContent = containsHebrew(content);
  const isCurrency = /[₪$€£]|ILS/.test(content) || /^[\d,\.]+\s*(?:[₪$€£]|ILS)/.test(content);
  const isIdNumber = /^\d{9}$/.test(content.trim()) || /^[0-9\-]{6,11}$/.test(content.trim());
  
  console.log(`Processing cell: ${content}, Hebrew: ${isHebrewContent}, Currency: ${isCurrency}, ID: ${isIdNumber}`);
  
  // Special handling for ID numbers to display correctly
  if (isIdNumber) {
    return { 
      text: forceLtrDirection(content),
      isRtl: false,
      isCurrency: false
    };
  }
  
  // Handle by content type
  if (isCurrency) {
    if (isHebrewContent) {
      // Hebrew currency uses special handling
      return { 
        text: processTableCellText(content),
        isRtl: true,
        isCurrency: true 
      };
    } else {
      // Non-Hebrew currency
      return { 
        text: forceLtrDirection(content),
        isRtl: false,
        isCurrency: true 
      };
    }
  } else if (/^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(content)) {
    // Date format - must be LTR
    return { 
      text: forceLtrDirection(content),
      isRtl: false,
      isCurrency: false 
    };
  } else if (/^[0-9\s\-\.\/]+$/.test(content)) {
    // Pure number (ID, phone, etc) - must be LTR
    return { 
      text: forceLtrDirection(content),
      isRtl: false,
      isCurrency: false 
    };
  } else if (isHebrewContent) {
    // Hebrew text needs proper RTL handling
    return { 
      text: isHebrewContent ? manuallyReverseString(content) : content,
      isRtl: true,
      isCurrency: false 
    };
  } else {
    // Other content (English, etc)
    return { 
      text: forceLtrDirection(content),
      isRtl: false,
      isCurrency: false 
    };
  }
};
