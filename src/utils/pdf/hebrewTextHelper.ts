
/**
 * Helper functions for handling Hebrew text and mixed content in PDFs
 * Enhanced with stronger bidirectional controls
 */

// Detect if text contains English characters or numbers only
const isEnglishOrNumber = (text: string): boolean => {
  if (!text) return false;
  // Match English letters, numbers, and common punctuation only
  return /^[a-zA-Z0-9\s\-\.\/\(\)\+\:]+$/.test(text);
};

// Detect if text contains numbers only (for phone numbers, ID numbers)
const isNumberOnly = (text: string): boolean => {
  if (!text) return false;
  // Match only digits and common number formatting characters
  return /^[0-9\s\-\.\/]+$/.test(text);
};

// Detect if text is a date in common formats
const isDateFormat = (text: string): boolean => {
  if (!text) return false;
  // Match common date formats (dd/mm/yyyy, etc.)
  return /^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(text);
};

// Detect if text is a phone number format
const isPhoneFormat = (text: string): boolean => {
  if (!text) return false;
  // Match common Israeli phone formats
  return /^0\d{1,2}[\-\s]?\d{7,8}$/.test(text);
};

/**
 * Process text to ensure correct display direction in PDF
 * - Apply much stronger directional control for English/numbers in RTL context
 * - Uses multiple Unicode control characters for stronger isolation
 */
export const processTextDirection = (text: string): string => {
  if (!text) return '';
  
  // For numbers, dates, phone numbers, and English text, we need the strongest possible LTR isolation
  if (isNumberOnly(text) || isDateFormat(text) || isPhoneFormat(text) || isEnglishOrNumber(text)) {
    // Apply completely explicit LTR override with the strongest combination of controls
    return forceLtrDirection(text);
  }

  // For Hebrew or mixed content, maintain RTL by default
  return text;
};

/**
 * Force LTR direction with the strongest possible Unicode control characters
 * Used for critical content that must be displayed left-to-right (dates, IDs, phone numbers)
 */
export const forceLtrDirection = (text: string): string => {
  if (!text) return '';
  
  // Stack multiple controls for maximum effect:
  // \u202D = Left-to-Right Override - strongest LTR control, forces all chars as LTR
  // \u200E = Left-to-Right Mark - reinforces LTR behavior
  // \u202A = Left-to-Right Embedding - establishes LTR context
  // \u202C = Pop Directional Formatting - properly terminates directional controls
  
  // Create the strongest possible LTR isolation with multiple nested controls
  return `\u202D\u200E${text}\u200E\u202C`;
};

/**
 * Helper function to ensure Hebrew text is properly displayed in PDF
 * Now optimized for Alef font
 */
export const encodeHebrewText = (text: string): string => {
  if (!text) return '';
  
  // With Alef font and RTL enabled, we can return text directly
  return text;
};

/**
 * Legacy helper function kept for backward compatibility
 */
export const reverseText = (text: string): string => {
  return text || '';
};

/**
 * Helper function specifically for tables to ensure RTL text is displayed correctly
 * with Alef font integration
 */
export const prepareRtlText = (text: string): string => {
  return processTextDirection(text);
};
