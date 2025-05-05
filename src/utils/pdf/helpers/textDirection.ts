
import { containsHebrew, isNumberOnly, isDateFormat, isPhoneFormat, isEnglishOrNumber, isHebrewCurrency } from './contentDetection';

/**
 * Process text to ensure correct display direction in PDF
 * Simplified to use minimal direction markers
 */
export const processTextDirection = (text: string): string => {
  if (!text) return '';
  
  // For numbers, dates, phone numbers, and English text, we use LTR
  if (isNumberOnly(text) || isDateFormat(text) || isPhoneFormat(text) || isEnglishOrNumber(text)) {
    // Simple LTR mark
    return `\u200E${text}`;
  }

  // For Hebrew or mixed content, add simple RTL marker
  if (containsHebrew(text)) {
    return `\u200F${text}`;
  }
  
  // Default - return unchanged for non-Hebrew text
  return text;
};

/**
 * Force LTR direction with simple LTR marker
 * Enhanced to always add LTR mark for consistent LTR display
 */
export const forceLtrDirection = (text: string): string => {
  if (!text) return '';
  
  // Always add LTR mark for consistent direction
  return `\u200E${text}`;
};

/**
 * Force RTL direction specifically for Hebrew text
 * Simplified to use just RLM
 */
export const forceRtlDirection = (text: string): string => {
  if (!text) return '';
  
  // Simple RTL mark
  return `\u200F${text}`;
};

/**
 * DEPRECATED - Never use this function!
 * This function is preserved only for backward compatibility
 */
export const manuallyReverseString = (text: string): string => {
  // Never reverse the string - just return it as is
  return text;
};

/**
 * Special processor for table cells to handle mixed content
 * Enhanced to always add LTR mark for numeric content
 */
export const processTableCellText = (text: string): string => {
  if (!text) return '';
  
  // Check content type to apply appropriate direction
  if (isNumberOnly(text) || isDateFormat(text) || isPhoneFormat(text)) {
    // Always add LTR mark for numeric content
    return `\u200E${text}`;
  } else if (isHebrewCurrency(text)) {
    // Special handling for Hebrew currency
    if (containsHebrew(text)) {
      return `\u200F${text}`; // Simple RTL mark
    } else {
      return `\u200E${text}`; // Simple LTR mark
    }
  } else if (containsHebrew(text)) {
    // Simple RTL mark for Hebrew text
    return `\u200F${text}`;
  }
  
  // Default for mixed or other content
  return text;
};

/**
 * Special formatter for Hebrew currency values in tables
 * Simplified to use simple RTL mark
 */
export const processHebrewCurrencyForTable = (text: string): string => {
  // Simple RTL mark for Hebrew currency
  return `\u200F${text}`;
};

/**
 * Helper function to ensure Hebrew text is properly displayed in PDF
 * Simplified to use simple RTL mark
 */
export const encodeHebrewText = (text: string): string => {
  if (!text) return '';
  
  // Simple RTL mark for Hebrew text
  return `\u200F${text}`;
};

/**
 * Legacy helper function kept for backward compatibility
 * Simplified to use simple RTL mark
 */
export const reverseText = (text: string): string => {
  // Apply simple RTL mark to text
  return text ? `\u200F${text}` : '';
};

/**
 * Helper function specifically for tables to ensure RTL text is displayed correctly
 * Simplified to use simple RTL mark
 */
export const prepareRtlText = (text: string): string => {
  // Simple RTL mark for Hebrew text
  return `\u200F${text}`;
};
