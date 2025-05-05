import { containsHebrew, isNumberOnly, isDateFormat, isPhoneFormat, isEnglishOrNumber, isHebrewCurrency } from './contentDetection';

/**
 * Process text to ensure correct display direction in PDF
 * Enhanced with strong directional embedding controls
 */
export const processTextDirection = (text: string): string => {
  if (!text) return '';
  
  // For numbers, dates, phone numbers, and English text, we use LTR embedding
  if (isNumberOnly(text) || isDateFormat(text) || isPhoneFormat(text) || isEnglishOrNumber(text)) {
    // Strong LTR embedding with proper isolation
    return `\u202A${text}\u202C`;
  }

  // For Hebrew or mixed content, add strong RTL embedding
  if (containsHebrew(text)) {
    return `\u202B${text}\u202C`;
  }
  
  // Default - return unchanged for non-Hebrew text
  return text;
};

/**
 * Force LTR direction with strong LTR embedding
 * Enhanced to use proper directional embedding for consistent LTR display
 */
export const forceLtrDirection = (text: string): string => {
  if (!text) return '';
  
  // Strong LTR embedding with proper isolation
  return `\u202A${text}\u202C`;
};

/**
 * Force RTL direction specifically for Hebrew text
 * Enhanced with strong RTL embedding
 */
export const forceRtlDirection = (text: string): string => {
  if (!text) return '';
  
  // Strong RTL embedding with proper isolation
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
 * Enhanced with strong directional embedding
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
      return `\u202B${text}\u202C`; // Strong RTL embedding
    } else {
      return `\u202A${text}\u202C`; // Strong LTR embedding
    }
  } else if (containsHebrew(text)) {
    // Strong RTL embedding for Hebrew text
    return `\u202B${text}\u202C`;
  }
  
  // Default for mixed or other content
  return text;
};

/**
 * Special formatter for Hebrew currency values in tables
 * Enhanced with strong RTL embedding
 */
export const processHebrewCurrencyForTable = (text: string): string => {
  // Strong RTL embedding for Hebrew currency
  return `\u202B${text}\u202C`;
};

/**
 * Helper function to ensure Hebrew text is properly displayed in PDF
 * Enhanced with strong RTL embedding
 */
export const encodeHebrewText = (text: string): string => {
  if (!text) return '';
  
  // Strong RTL embedding for Hebrew text
  return `\u202B${text}\u202C`;
};

/**
 * Legacy helper function kept for backward compatibility
 * Enhanced with strong RTL embedding
 */
export const reverseText = (text: string): string => {
  // Apply strong RTL embedding to text
  return text ? `\u202B${text}\u202C` : '';
};

/**
 * Helper function specifically for tables to ensure RTL text is displayed correctly
 * Enhanced with strong RTL embedding
 */
export const prepareRtlText = (text: string): string => {
  // Strong RTL embedding for Hebrew text
  return `\u202B${text}\u202C`;
};
