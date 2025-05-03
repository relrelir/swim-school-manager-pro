
/**
 * Helper functions for handling Hebrew text and mixed content in PDFs
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
 * - Apply enhanced directional control for English/numbers in RTL context
 * - Uses multiple Unicode control characters for stronger isolation
 */
export const processTextDirection = (text: string): string => {
  if (!text) return '';
  
  // For numbers, dates, phone numbers, and English text, we need stronger LTR isolation
  if (isNumberOnly(text) || isDateFormat(text) || isPhoneFormat(text) || isEnglishOrNumber(text)) {
    // Enhanced isolation using multiple control characters:
    // \u202A = Left-to-Right Embedding (LRE) - start LTR context
    // \u202C = Pop Directional Formatting (PDF) - end directional context
    // \u200E = Left-to-Right Mark (LRM) - additional LTR mark
    
    // Create a strong LTR isolation with multiple markers
    return `\u202A\u200E${text}\u200E\u202C`;
  }

  // For Hebrew or mixed content, maintain RTL by default
  return text;
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

/**
 * Process text explicitly as LTR content, with strongest possible isolation
 * Used for critical content that must be displayed left-to-right
 */
export const forceLtrDirection = (text: string): string => {
  if (!text) return '';
  
  // \u202A = Left-to-Right Embedding (LRE) - start LTR context
  // \u202D = Left-to-Right Override (LRO) - forces LTR
  // \u202C = Pop Directional Formatting (PDF) - end directional context
  // \u200E = Left-to-Right Mark (LRM)
  
  // Create the strongest possible LTR isolation
  return `\u202D\u200E${text}\u200E\u202C`;
};

