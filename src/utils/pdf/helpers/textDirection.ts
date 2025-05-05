import { containsHebrew, isNumberOnly, isDateFormat, isPhoneFormat, isEnglishOrNumber, isHebrewCurrency } from './contentDetection';

/**
 * Process text to ensure correct display direction in PDF
 * Enhanced to use stronger directional embedding
 */
export const processTextDirection = (text: string): string => {
  if (!text) return '';
  
  // For numbers, dates, phone numbers, and English text, we use LTR EMBEDDING
  if (isNumberOnly(text) || isDateFormat(text) || isPhoneFormat(text) || isEnglishOrNumber(text)) {
    // Use LTR EMBEDDING (stronger than LTR mark)
    return `\u202A${text}\u202C`; // LRE + PDF
  }

  // For Hebrew or mixed content, add RTL EMBEDDING
  if (containsHebrew(text)) {
    return `\u202B${text}\u202C`; // RLE + PDF
  }
  
  // Default - return unchanged for non-Hebrew text
  return text;
};

/**
 * Force LTR direction with LTR EMBEDDING
 * Enhanced to use stronger LTR control for consistent LTR display
 */
export const forceLtrDirection = (text: string): string => {
  if (!text) return '';
  
  // Use LTR EMBEDDING for stronger direction control
  return `\u202A${text}\u202C`; // LRE + PDF
};

/**
 * Force RTL direction specifically for Hebrew text
 * Enhanced to use RTL EMBEDDING
 */
export const forceRtlDirection = (text: string): string => {
  if (!text) return '';
  
  // Use RTL EMBEDDING for stronger direction control
  return `\u202B${text}\u202C`; // RLE + PDF
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
 * Enhanced to use stronger direction embedding
 */
export const processTableCellText = (text: string): string => {
  if (!text) return '';
  
  // Check content type to apply appropriate direction
  if (isNumberOnly(text) || isDateFormat(text) || isPhoneFormat(text)) {
    // Use LTR EMBEDDING for numeric content
    return `\u202A${text}\u202C`; // LRE + PDF
  } else if (isHebrewCurrency(text)) {
    // Special handling for Hebrew currency
    if (containsHebrew(text)) {
      return `\u202B${text}\u202C`; // RLE + PDF - stronger than RTL mark
    } else {
      return `\u202A${text}\u202C`; // LRE + PDF - stronger than LTR mark
    }
  } else if (containsHebrew(text)) {
    // RTL EMBEDDING for Hebrew text
    return `\u202B${text}\u202C`; // RLE + PDF
  }
  
  // Default for mixed or other content
  return text;
};

/**
 * Special formatter for Hebrew currency values in tables
 * Enhanced to use RTL EMBEDDING
 */
export const processHebrewCurrencyForTable = (text: string): string => {
  // RTL EMBEDDING for Hebrew currency
  return `\u202B${text}\u202C`; // RLE + PDF
};

/**
 * Helper function to ensure Hebrew text is properly displayed in PDF
 * Enhanced to use RTL EMBEDDING
 */
export const encodeHebrewText = (text: string): string => {
  if (!text) return '';
  
  // RTL EMBEDDING for Hebrew text
  return `\u202B${text}\u202C`; // RLE + PDF
};

/**
 * Legacy helper function kept for backward compatibility
 * Enhanced to use RTL EMBEDDING
 */
export const reverseText = (text: string): string => {
  // Apply RTL EMBEDDING to text
  return text ? `\u202B${text}\u202C` : ''; // RLE + PDF
};

/**
 * Helper function specifically for tables to ensure RTL text is displayed correctly
 * Enhanced to use RTL EMBEDDING
 */
export const prepareRtlText = (text: string): string => {
  // RTL EMBEDDING for Hebrew text
  return `\u202B${text}\u202C`; // RLE + PDF
};
