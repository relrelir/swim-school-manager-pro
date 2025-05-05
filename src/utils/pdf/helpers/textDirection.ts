
import { containsHebrew, isNumberOnly, isDateFormat, isPhoneFormat, isEnglishOrNumber, isHebrewCurrency } from './contentDetection';

/**
 * Process text to ensure correct display direction in PDF
 * CRITICAL FIX: Ensures Hebrew text is displayed correctly without reversing
 */
export const processTextDirection = (text: string): string => {
  if (!text) return '';
  
  // For numbers, dates, phone numbers, and English text, we need the strongest possible LTR isolation
  if (isNumberOnly(text) || isDateFormat(text) || isPhoneFormat(text) || isEnglishOrNumber(text)) {
    // Apply completely explicit LTR override with the strongest combination of controls
    return forceLtrDirection(text);
  }

  // CRITICAL FIX: For Hebrew or mixed content, don't modify the text - 
  // Let PDF with Alef font handle it correctly
  return text;
};

/**
 * Force LTR direction with the strongest possible Unicode control characters
 * Used for critical content that must be displayed left-to-right (dates, IDs, phone numbers)
 */
export const forceLtrDirection = (text: string): string => {
  if (!text) return '';
  
  // Stack multiple controls for maximum effect:
  // \u202D = Left-to-Right Override - strongest LTR control
  // \u200E = Left-to-Right Mark - reinforces LTR behavior
  // Close with \u202C to terminate directional controls
  
  return `\u202D\u200E${text}\u200E\u202C`;
};

/**
 * Force RTL direction specifically for Hebrew text in tables
 * CRITICAL FIX: Does NOT reverse or modify the text in any way
 */
export const forceRtlDirection = (text: string): string => {
  if (!text) return '';
  
  // CRITICAL FIX: Do NOT reverse or modify the text - just return it directly
  return text;
};

/**
 * DEPRECATED - Never use this function!
 * This function is preserved only for backward compatibility
 * CRITICAL FIX: No longer reverses strings in any circumstance
 */
export const manuallyReverseString = (text: string): string => {
  // CRITICAL FIX: Never reverse the string - just return it as is
  return text;
};

/**
 * Special processor for table cells to handle mixed content
 * CRITICAL FIX: Never reverses Hebrew text, ensures proper directionality
 */
export const processTableCellText = (text: string): string => {
  if (!text) return '';
  
  // Check content type to apply appropriate direction
  if (isNumberOnly(text) || isDateFormat(text) || isPhoneFormat(text)) {
    // Numeric content always gets LTR
    return forceLtrDirection(text);
  } else if (isHebrewCurrency(text)) {
    // Special handling for Hebrew currency
    if (containsHebrew(text)) {
      return text; // CRITICAL FIX: Don't modify Hebrew currency text
    } else {
      return forceLtrDirection(text);
    }
  } else if (containsHebrew(text)) {
    // CRITICAL FIX: Pure Hebrew text - return as is, no manipulation
    return text;
  }
  
  // Default for mixed or other content
  return text;
};

/**
 * Special formatter for Hebrew currency values in tables
 * CRITICAL FIX: Ensures currency symbols display correctly without reversing text
 */
export const processHebrewCurrencyForTable = (text: string): string => {
  // CRITICAL FIX: Don't manipulate the text structure, just preserve the original formatting
  return text;
};

/**
 * Helper function to ensure Hebrew text is properly displayed in PDF
 * CRITICAL FIX: With Alef font, no text manipulation is needed
 */
export const encodeHebrewText = (text: string): string => {
  if (!text) return '';
  
  // CRITICAL FIX: With Alef font and RTL enabled, we can return text directly
  // without any manipulation
  return text;
};

/**
 * Legacy helper function kept for backward compatibility
 * CRITICAL FIX: Never reverses text under any circumstances
 */
export const reverseText = (text: string): string => {
  // CRITICAL FIX: Simply return the text as is
  return text || '';
};

/**
 * Helper function specifically for tables to ensure RTL text is displayed correctly
 */
export const prepareRtlText = (text: string): string => {
  // CRITICAL FIX: Don't modify the text structure
  return text;
};
