
import { processTableCellText, forceLtrDirection } from '../textDirection';
import { containsHebrew } from '../contentDetection';

/**
 * Process cell text based on content type for optimal table display
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
    // ID numbers need special handling - must be LTR regardless of context
    return { 
      text: forceLtrDirection(content),
      isRtl: false,
      isCurrency: false 
    };
  }
  // Process by content type for optimal display
  else if (isCurrency) {
    if (isHebrewContent) {
      // Hebrew currency needs special handling
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
    // Date format - always LTR
    return { 
      text: forceLtrDirection(content),
      isRtl: false,
      isCurrency: false 
    };
  } else if (/^[0-9\s\-\.\/]+$/.test(content)) {
    // Pure number (ID numbers, phone numbers, etc) - always LTR
    return { 
      text: forceLtrDirection(content),
      isRtl: false,
      isCurrency: false 
    };
  } else if (isHebrewContent) {
    // Pure Hebrew text - DO NOT reverse characters anymore
    return { 
      text: content, // Changed from manuallyReverseString to keep original order
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
