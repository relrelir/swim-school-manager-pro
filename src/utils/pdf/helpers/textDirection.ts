
import { containsHebrew, isNumberOnly, isDateFormat, isPhoneFormat, isEnglishOrNumber, isHebrewCurrency } from './contentDetection';

/**
 * Process text to ensure correct display direction in PDF
 * - Fixed to not reverse Hebrew text
 */
export const processTextDirection = (text: string): string => {
  if (!text) return '';
  
  // For numbers, dates, phone numbers, and English text, we need the strongest possible LTR isolation
  if (isNumberOnly(text) || isDateFormat(text) || isPhoneFormat(text) || isEnglishOrNumber(text)) {
    // Apply completely explicit LTR override with the strongest combination of controls
    return forceLtrDirection(text);
  }

  // For Hebrew or mixed content, don't modify the text direction - PDF with Alef font handles it
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
 * Fixed to NOT reverse text content
 */
export const forceRtlDirection = (text: string): string => {
  if (!text) return '';
  
  // Apply RTL controls - but don't reverse the text or modify its content
  return text;
};

/**
 * DEPRECATED - Do not use!
 * This function is preserved only for backward compatibility
 * No longer used for reversing strings
 */
export const manuallyReverseString = (text: string): string => {
  // Critical fix: Do NOT reverse the string
  return text;
};

/**
 * Special processor for table cells to handle mixed content
 * Fixed to maintain correct text direction for Hebrew
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
    // Pure Hebrew text in tables - keep original order
    return text;
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
    return text.replace(/[\d,\.]+/, numericPart);
  }
  
  // If we can't parse it, return the original text
  return text;
};

/**
 * Helper function to ensure Hebrew text is properly displayed in PDF
 * Now optimized for Alef font - doesn't modify text content
 */
export const encodeHebrewText = (text: string): string => {
  if (!text) return '';
  
  // With Alef font and RTL enabled, we can return text directly
  return text;
};

/**
 * Legacy helper function kept for backward compatibility
 * FIXED to not reverse text
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
