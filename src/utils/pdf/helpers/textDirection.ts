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

  // CRITICAL FIX: For Hebrew or mixed content, add RTL isolation
  if (containsHebrew(text)) {
    // Use strongest RTL isolation for Hebrew text
    return forceRtlDirection(text);
  }
  
  // Default - return unchanged for non-Hebrew text
  return text;
};

/**
 * Force LTR direction with the strongest possible Unicode control characters
 * Used for critical content that must be displayed left-to-right (dates, IDs, phone numbers)
 */
export const forceLtrDirection = (text: string): string => {
  if (!text) return '';
  
  // Use LTR Isolate for maximum isolation:
  // \u2066 = Left-to-Right Isolate - strongest LTR control
  // \u2069 = Pop Directional Isolate - end isolation
  
  return `\u2066${text}\u2069`;
};

/**
 * Force RTL direction specifically for Hebrew text in tables
 * CRITICAL FIX: Use bidirectional isolation for Hebrew text
 */
export const forceRtlDirection = (text: string): string => {
  if (!text) return '';
  
  // Use RTL Isolate for maximum isolation:
  // \u2067 = Right-to-Left Isolate - strongest RTL control
  // \u2069 = Pop Directional Isolate - end isolation
  
  return `\u2067${text}\u2069`;
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
 * CRITICAL FIX: Apply bidirectional isolation for proper handling
 */
export const processTableCellText = (text: string): string => {
  if (!text) return '';
  
  // Check content type to apply appropriate direction
  if (isNumberOnly(text) || isDateFormat(text) || isPhoneFormat(text)) {
    // Numeric content always gets LTR isolation
    return forceLtrDirection(text);
  } else if (isHebrewCurrency(text)) {
    // Special handling for Hebrew currency
    if (containsHebrew(text)) {
      return forceRtlDirection(text); // Use RTL markers for Hebrew currency
    } else {
      return forceLtrDirection(text);
    }
  } else if (containsHebrew(text)) {
    // CRITICAL FIX: Use strongest RTL isolation for Hebrew text
    return forceRtlDirection(text);
  }
  
  // Default for mixed or other content
  return text;
};

/**
 * Special formatter for Hebrew currency values in tables
 * CRITICAL FIX: Use bidirectional isolation for currency values
 */
export const processHebrewCurrencyForTable = (text: string): string => {
  // Use RTL isolation for Hebrew currency
  return forceRtlDirection(text);
};

/**
 * Helper function to ensure Hebrew text is properly displayed in PDF
 * CRITICAL FIX: Use bidirectional isolation for Hebrew text
 */
export const encodeHebrewText = (text: string): string => {
  if (!text) return '';
  
  // CRITICAL FIX: Add RTL isolation for Hebrew text
  return forceRtlDirection(text);
};

/**
 * Legacy helper function kept for backward compatibility
 * CRITICAL FIX: Use bidirectional isolation for Hebrew text
 */
export const reverseText = (text: string): string => {
  // CRITICAL FIX: Apply RTL isolation to text
  return text ? forceRtlDirection(text) : '';
};

/**
 * Helper function specifically for tables to ensure RTL text is displayed correctly
 * CRITICAL FIX: Use bidirectional isolation for Hebrew text in tables
 */
export const prepareRtlText = (text: string): string => {
  // CRITICAL FIX: Apply RTL isolation to text
  return forceRtlDirection(text);
};
