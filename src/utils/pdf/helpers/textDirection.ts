import { containsHebrew, isNumberOnly, isDateFormat, isPhoneFormat, isEnglishOrNumber, isHebrewCurrency } from './contentDetection';
import { formatPdfField } from './textFormatting';

/**
 * Process text to ensure correct display direction in PDF
 * Using dedicated formatting utilities
 */
export const processTextDirection = (text: string): string => {
  if (!text) return '';
  
  // For numbers, dates, phone numbers, and English text, we use LTR
  if (isNumberOnly(text) || isDateFormat(text) || isPhoneFormat(text) || isEnglishOrNumber(text)) {
    return formatPdfField(text, 'number');
  }

  // For Hebrew or mixed content, use RTL markers
  if (containsHebrew(text)) {
    return formatPdfField(text, 'text');
  }
  
  // Default - return unchanged for non-Hebrew text
  return text;
};

/**
 * Force LTR direction with LRM markers
 */
export const forceLtrDirection = (text: string): string => {
  if (!text) return '';
  return formatPdfField(text, 'number');
};

/**
 * Force RTL direction specifically for Hebrew text
 */
export const forceRtlDirection = (text: string): string => {
  if (!text) return '';
  return formatPdfField(text, 'text');
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
 * Using dedicated formatting utilities
 */
export const processTableCellText = (text: string): string => {
  if (!text) return '';
  
  // Check content type to apply appropriate direction
  if (isNumberOnly(text) || isDateFormat(text) || isPhoneFormat(text)) {
    return formatPdfField(text, 'number');
  } else if (isHebrewCurrency(text)) {
    // Special handling for Hebrew currency
    if (containsHebrew(text)) {
      return formatPdfField(text, 'text'); 
    } else {
      return formatPdfField(text, 'number');
    }
  } else if (containsHebrew(text)) {
    return formatPdfField(text, 'text');
  }
  
  // Default for mixed or other content
  return text;
};

/**
 * Special formatter for Hebrew currency values in tables
 */
export const processHebrewCurrencyForTable = (text: string): string => {
  return formatPdfField(text, 'number');
};

/**
 * Helper function to ensure Hebrew text is properly displayed in PDF
 */
export const encodeHebrewText = (text: string): string => {
  if (!text) return '';
  return formatPdfField(text, 'text');
};

/**
 * Legacy helper function kept for backward compatibility
 */
export const reverseText = (text: string): string => {
  return text ? formatPdfField(text, 'text') : '';
};

/**
 * Helper function specifically for tables to ensure RTL text is displayed correctly
 */
export const prepareRtlText = (text: string): string => {
  return formatPdfField(text, 'text');
};
