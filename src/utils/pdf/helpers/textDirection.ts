
import { containsHebrew, isNumberOnly, isDateFormat, isPhoneFormat, isEnglishOrNumber, isHebrewCurrency } from './contentDetection';

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
 * Force RTL direction specifically for Hebrew text in tables
 * This helps ensure Hebrew text renders correctly in table contexts
 */
export const forceRtlDirection = (text: string): string => {
  if (!text) return '';
  
  // Apply RTL controls:
  // \u202E = Right-to-Left Override - forces characters as RTL
  // \u200F = Right-to-Left Mark - reinforces RTL behavior
  // \u202B = Right-to-Left Embedding - establishes RTL context
  // \u202C = Pop Directional Formatting - terminates directional controls
  
  return `\u202B\u200F${text}\u200F\u202C`;
};

/**
 * Manually reverse a string character by character
 * This is useful for Hebrew text in tables where bidirectional controls don't work properly
 */
export const manuallyReverseString = (text: string): string => {
  if (!text) return '';
  return [...text].reverse().join('');
};

/**
 * Special processor for table cells to handle mixed content
 * More aggressive handling for tables specifically
 */
export const processTableCellText = (text: string): string => {
  if (!text) return '';
  
  // Check content type to apply appropriate direction
  if (isNumberOnly(text) || isDateFormat(text) || isPhoneFormat(text)) {
    // Numeric content always gets LTR
    return forceLtrDirection(text);
  } else if (isHebrewCurrency(text)) {
    if (containsHebrew(text)) {
      // Hebrew currency needs special handling to display correctly in tables
      // Try to preserve the shekel symbol position while making text RTL
      return processHebrewCurrencyForTable(text);
    } else {
      // Non-Hebrew currency should be LTR
      return forceLtrDirection(text);
    }
  } else if (containsHebrew(text)) {
    // Pure Hebrew text in tables needs RTL enforcement AND characters manually reversed
    // This is a specific fix for tables where standard RTL controls don't work properly
    return manuallyReverseString(text);
  }
  
  // Default for mixed content
  return processTextDirection(text);
};

/**
 * Special formatter for Hebrew currency values in tables
 * This ensures the currency symbol renders correctly
 */
export const processHebrewCurrencyForTable = (text: string): string => {
  // Handle shekel symbol position - it should appear on the right in Hebrew context
  // but autoTable may need different handling
  
  // Extract numeric part if possible
  const numericMatch = text.match(/[\d,\.]+/);
  
  if (numericMatch) {
    // Split the currency value into numeric part and symbol
    const numericPart = forceLtrDirection(numericMatch[0]);
    // Construct the currency string with explicit bidirectional control
    return `\u202B\u200F${text.replace(/[\d,\.]+/, numericPart)}\u200F\u202C`;
  }
  
  // If we can't parse it, apply RTL to the whole string
  return forceRtlDirection(text);
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
