import { containsHebrew, isNumberOnly, isDateFormat, isPhoneFormat, isEnglishOrNumber, isHebrewCurrency } from './contentDetection';

/**
 * Process text to ensure correct display direction in PDF
 * Enhanced to use strong directional embedding
 */
export const processTextDirection = (text: string): string => {
  if (!text) return '';
  
  // For numbers, dates, phone numbers, and English text, we use LTR EMBEDDING
  if (isNumberOnly(text) || isDateFormat(text) || isPhoneFormat(text) || isEnglishOrNumber(text)) {
    // LTR EMBEDDING (stronger than mark)
    return `\u202A${text}\u202C`;
  }

  // For Hebrew or mixed content, add RTL EMBEDDING (stronger than mark)
  if (containsHebrew(text)) {
    return `\u202B${text}\u202C`;
  }
  
  // Default - return unchanged for non-Hebrew text
  return text;
};

/**
 * Force LTR direction with LTR EMBEDDING (stronger than mark)
 * Enhanced to always add LTR EMBEDDING for consistent LTR display
 */
export const forceLtrDirection = (text: string): string => {
  if (!text) return '';
  
  // Always add LTR EMBEDDING for consistent direction
  return `\u202A${text}\u202C`;
};

/**
 * Force RTL direction specifically for Hebrew text
 * Enhanced to use RTL EMBEDDING (stronger than mark)
 */
export const forceRtlDirection = (text: string): string => {
  if (!text) return '';
  
  // RTL EMBEDDING (stronger than mark)
  return `\u202B${text}\u202C`;
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
 * Enhanced to use strong directional embedding
 */
export const processTableCellText = (text: string): string => {
  if (!text) return '';
  
  // Check content type to apply appropriate direction
  if (isNumberOnly(text) || isDateFormat(text) || isPhoneFormat(text)) {
    // Add LTR EMBEDDING for numeric content
    return `\u202A${text}\u202C`;
  } else if (isHebrewCurrency(text)) {
    // Special handling for Hebrew currency
    if (containsHebrew(text)) {
      return `\u202B${text}\u202C`; // RTL EMBEDDING (stronger than mark)
    } else {
      return `\u202A${text}\u202C`; // LTR EMBEDDING (stronger than mark)
    }
  } else if (containsHebrew(text)) {
    // RTL EMBEDDING for Hebrew text
    return `\u202B${text}\u202C`;
  }
  
  // Default for mixed or other content
  return text;
};

/**
 * Special formatter for Hebrew currency values in tables
 * Enhanced to use RTL EMBEDDING (stronger than mark)
 */
export const processHebrewCurrencyForTable = (text: string): string => {
  // RTL EMBEDDING for Hebrew currency
  return `\u202B${text}\u202C`;
};

/**
 * Helper function to ensure Hebrew text is properly displayed in PDF
 * Enhanced to use RTL EMBEDDING (stronger than mark)
 */
export const encodeHebrewText = (text: string): string => {
  if (!text) return '';
  
  // RTL EMBEDDING for Hebrew text
  return `\u202B${text}\u202C`;
};

/**
 * Legacy helper function kept for backward compatibility
 * Enhanced to use RTL EMBEDDING (stronger than mark)
 */
export const reverseText = (text: string): string => {
  // Apply RTL EMBEDDING to text
  return text ? `\u202B${text}\u202C` : '';
};

/**
 * Helper function specifically for tables to ensure RTL text is displayed correctly
 * Enhanced to use RTL EMBEDDING (stronger than mark)
 */
export const prepareRtlText = (text: string): string => {
  // RTL EMBEDDING for Hebrew text
  return `\u202B${text}\u202C`;
};
