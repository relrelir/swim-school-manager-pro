import { containsHebrew, isNumberOnly, isDateFormat, isPhoneFormat, isEnglishOrNumber, isHebrewCurrency } from './contentDetection';

/**
 * Process text to ensure correct display direction in PDF
 * Using stronger LTR embedding for numeric content
 */
export const processTextDirection = (text: string): string => {
  if (!text) return '';
  
  // For numbers, dates, phone numbers, and English text, use LTR EMBEDDING
  if (isNumberOnly(text) || isDateFormat(text) || isPhoneFormat(text) || isEnglishOrNumber(text)) {
    // Strong LTR embedding
    return `\u202A${text}\u202C`;
  }

  // For Hebrew or mixed content, add RTL marker
  if (containsHebrew(text)) {
    return `\u200F${text}`;
  }
  
  // Default - return unchanged for non-Hebrew text
  return text;
};

/**
 * Force LTR direction with strong LTR embedding
 */
export const forceLtrDirection = (text: string): string => {
  if (!text) return '';
  
  // Strong LTR embedding
  return `\u202A${text}\u202C`;
};

/**
 * Force RTL direction specifically for Hebrew text
 */
export const forceRtlDirection = (text: string): string => {
  if (!text) return '';
  
  // RTL mark
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
 * Using stronger direction markers
 */
export const processTableCellText = (text: string): string => {
  if (!text) return '';
  
  // Check content type to apply appropriate direction
  if (isNumberOnly(text) || isDateFormat(text) || isPhoneFormat(text)) {
    // Strong LTR embedding for numeric content
    return `\u202A${text}\u202C`;
  } else if (isHebrewCurrency(text)) {
    // Special handling for Hebrew currency
    if (containsHebrew(text)) {
      return `\u200F${text}`; // RTL mark
    } else {
      return `\u202A${text}\u202C`; // LTR embedding
    }
  } else if (containsHebrew(text)) {
    // RTL mark for Hebrew text
    return `\u200F${text}`;
  }
  
  // Default for mixed or other content
  return text;
};

/**
 * Special formatter for Hebrew currency values in tables
 */
export const processHebrewCurrencyForTable = (text: string): string => {
  // RTL mark for Hebrew currency
  return `\u200F${text}`;
};

/**
 * Helper function to ensure Hebrew text is properly displayed in PDF
 */
export const encodeHebrewText = (text: string): string => {
  if (!text) return '';
  
  // RTL mark for Hebrew text
  return `\u200F${text}`;
};

/**
 * Legacy helper function kept for backward compatibility
 */
export const reverseText = (text: string): string => {
  // Apply RTL mark to text
  return text ? `\u200F${text}` : '';
};

/**
 * Helper function specifically for tables to ensure RTL text is displayed correctly
 */
export const prepareRtlText = (text: string): string => {
  // RTL mark for Hebrew text
  return `\u200F${text}`;
};
