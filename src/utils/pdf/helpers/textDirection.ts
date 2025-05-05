import { containsHebrew, isNumberOnly, isDateFormat, isPhoneFormat, isEnglishOrNumber, isHebrewCurrency } from './contentDetection';
import { formatPdfField, forceLtrDirection as forceLtrDirectionFormat, forceRtlDirection as forceRtlDirectionFormat } from './textFormatting';

/**
 * Process text to ensure correct display direction in PDF
 * Using format utilities for consistent bidirectional text handling
 */
export const processTextDirection = (text: string): string => {
  if (!text) return '';
  
  // For numbers, dates, phone numbers, and English text, we use LTR embedding
  if (isNumberOnly(text) || isDateFormat(text) || isPhoneFormat(text) || isEnglishOrNumber(text)) {
    // Use our utility function for LTR text with proper embedding
    return forceLtrDirectionFormat(text);
  }

  // For Hebrew or mixed content, use our utility function with embedding
  if (containsHebrew(text)) {
    return forceRtlDirectionFormat(text);
  }
  
  // Default - return unchanged for non-Hebrew text
  return text;
};

/**
 * Force LTR direction with proper LTR embedding
 */
export const forceLtrDirection = (text: string): string => {
  return forceLtrDirectionFormat(text);
};

/**
 * Force RTL direction specifically for Hebrew text with proper embedding
 */
export const forceRtlDirection = (text: string): string => {
  return forceRtlDirectionFormat(text);
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
 */
export const processTableCellText = (text: string): string => {
  if (!text) return '';
  
  return formatPdfField(text);
};

/**
 * Special formatter for Hebrew currency values in tables
 */
export const processHebrewCurrencyForTable = (text: string): string => {
  return forceRtlDirectionFormat(text);
};

/**
 * Helper function to ensure Hebrew text is properly displayed in PDF
 */
export const encodeHebrewText = (text: string): string => {
  if (!text) return '';
  
  return forceRtlDirectionFormat(text);
};

/**
 * Legacy helper function kept for backward compatibility
 */
export const reverseText = (text: string): string => {
  return text ? forceRtlDirectionFormat(text) : '';
};

/**
 * Helper function specifically for tables to ensure RTL text is displayed correctly
 */
export const prepareRtlText = (text: string): string => {
  return forceRtlDirectionFormat(text);
};
