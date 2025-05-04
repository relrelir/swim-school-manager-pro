import { containsHebrew, isNumberOnly, isDateFormat, isPhoneFormat, isEnglishOrNumber, isHebrewCurrency } from './contentDetection';

/**
 * Process text to ensure correct display direction in PDF
 */
export const processTextDirection = (text: string): string => {
  if (!text) return '';
  
  // For numbers, dates, phone numbers, and English text, we need the strongest possible LTR isolation
  if (isNumberOnly(text) || isDateFormat(text) || isPhoneFormat(text) || isEnglishOrNumber(text)) {
    // Apply completely explicit LTR override for numeric/English content
    return forceLtrDirection(text);
  }

  // For Hebrew or mixed content, maintain RTL by default
  return text;
};

/**
 * Force LTR direction with stronger Unicode control characters
 * Enhanced to ensure ID numbers display correctly
 */
export const forceLtrDirection = (text: string): string => {
  if (!text) return '';
  
  // Even stronger combination of directional controls for critical data like IDs
  // \u202D = Left-to-Right Override 
  // \u200E = Left-to-Right Mark
  // \u202A = Left-to-Right Embedding
  // \u202C = Pop Directional Formatting
  
  return `\u202D\u200E${text}\u200E\u202C`;
};

/**
 * Force RTL direction with enhanced control
 */
export const forceRtlDirection = (text: string): string => {
  if (!text) return '';
  
  // Apply stronger RTL controls for Hebrew text
  // \u202B = Right-to-Left Embedding
  // \u200F = Right-to-Left Mark  
  return `\u202B\u200F${text}\u200F\u202C`;
};

/**
 * Manually reverse a string character by character
 * This is a last resort for Hebrew text in tables where bidirectional controls don't work
 */
export const manuallyReverseString = (text: string): string => {
  if (!text) return '';
  return [...text].reverse().join('');
};

/**
 * Special processor for table cells with improved handling for Hebrew text
 */
export const processTableCellText = (text: string): string => {
  if (!text) return '';
  
  // Specific handling based on content type
  if (isNumberOnly(text) || isDateFormat(text) || isPhoneFormat(text)) {
    // Numeric content must be LTR
    return forceLtrDirection(text);
  } else if (isHebrewCurrency(text)) {
    // Special currency handling to maintain symbol position
    return processHebrewCurrencyForTable(text);
  } else if (containsHebrew(text)) {
    // Handle RTL Hebrew text correctly in tables
    // For pure Hebrew, we need to manually reverse in some cases
    return forceRtlDirection(text);
  }
  
  // Default handling
  return processTextDirection(text);
};

/**
 * Special formatter for Hebrew currency values
 */
export const processHebrewCurrencyForTable = (text: string): string => {
  if (!text) return '';
  
  // Extract numeric part if possible
  const numericMatch = text.match(/[\d,\.]+/);
  
  if (numericMatch && containsHebrew(text)) {
    // Split the currency value into numeric part and symbol
    const numericPart = forceLtrDirection(numericMatch[0]);
    // Construct with explicit control
    return `\u202B\u200F${text.replace(/[\d,\.]+/, numericPart)}\u200F\u202C`;
  }
  
  return isEnglishOrNumber(text) ? forceLtrDirection(text) : forceRtlDirection(text);
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
