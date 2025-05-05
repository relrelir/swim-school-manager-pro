import { containsHebrew, isNumberOnly, isDateFormat, isPhoneFormat, isEnglishOrNumber, isHebrewCurrency } from './contentDetection';

/**
 * Process text to ensure correct display direction in PDF
 * CRITICAL FIX: Ensures Hebrew text is displayed correctly with stronger RTL markers
 */
export const processTextDirection = (text: string): string => {
  if (!text) return '';
  
  // For numbers, dates, phone numbers, and English text, we need the strongest possible LTR isolation
  if (isNumberOnly(text) || isDateFormat(text) || isPhoneFormat(text) || isEnglishOrNumber(text)) {
    // Apply completely explicit LTR override with the strongest combination of controls
    return forceLtrDirection(text);
  }

  // CRITICAL FIX: For Hebrew or mixed content, add multiple RTL markers for maximum compatibility
  if (containsHebrew(text)) {
    // Use strongest RTL direction control
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
  
  // Use multiple LTR control characters for maximum compatibility:
  // \u202A = Left-to-Right Embedding (LRE)
  // \u202D = Left-to-Right Override (LRO) - strongest override
  // \u2066 = Left-to-Right Isolate (LRI) - strongest isolation
  // \u2069 = Pop Directional Isolate (PDI)
  // \u202C = Pop Directional Formatting (PDF)
  
  return `\u202A\u202D\u2066${text}\u2069\u202C`;
};

/**
 * Force RTL direction specifically for Hebrew text in tables
 * CRITICAL FIX: Use multiple bidirectional control characters for Hebrew text
 */
export const forceRtlDirection = (text: string): string => {
  if (!text) return '';
  
  // Use multiple RTL control characters for maximum compatibility:
  // \u202B = Right-to-Left Embedding (RLE)
  // \u202E = Right-to-Left Override (RLO) - strongest override
  // \u2067 = Right-to-Left Isolate (RLI)
  // \u2069 = Pop Directional Isolate (PDI)
  // \u202C = Pop Directional Formatting (PDF)
  
  return `\u202B\u202E\u2067${text}\u2069\u202C`;
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
 * CRITICAL FIX: Apply stronger bidirectional control for proper handling
 */
export const processTableCellText = (text: string): string => {
  if (!text) return '';
  
  // Check content type to apply appropriate direction
  if (isNumberOnly(text) || isDateFormat(text) || isPhoneFormat(text)) {
    // Numeric content always gets LTR isolation with multiple controls
    return forceLtrDirection(text);
  } else if (isHebrewCurrency(text)) {
    // Special handling for Hebrew currency
    if (containsHebrew(text)) {
      return forceRtlDirection(text); // Use multiple RTL markers for Hebrew currency
    } else {
      return forceLtrDirection(text);
    }
  } else if (containsHebrew(text)) {
    // CRITICAL FIX: Use multiple RTL control characters for Hebrew text
    return forceRtlDirection(text);
  }
  
  // Default for mixed or other content
  return text;
};

/**
 * Special formatter for Hebrew currency values in tables
 * CRITICAL FIX: Use stronger bidirectional control for currency values
 */
export const processHebrewCurrencyForTable = (text: string): string => {
  // Use multiple RTL control characters for Hebrew currency
  return forceRtlDirection(text);
};

/**
 * Helper function to ensure Hebrew text is properly displayed in PDF
 * CRITICAL FIX: Use multiple bidirectional control characters for Hebrew text
 */
export const encodeHebrewText = (text: string): string => {
  if (!text) return '';
  
  // CRITICAL FIX: Add multiple RTL control characters for Hebrew text
  return forceRtlDirection(text);
};

/**
 * Legacy helper function kept for backward compatibility
 * CRITICAL FIX: Use bidirectional isolation for Hebrew text with stronger controls
 */
export const reverseText = (text: string): string => {
  // CRITICAL FIX: Apply multiple RTL control characters to text
  return text ? forceRtlDirection(text) : '';
};

/**
 * Helper function specifically for tables to ensure RTL text is displayed correctly
 * CRITICAL FIX: Use stronger bidirectional control for Hebrew text in tables
 */
export const prepareRtlText = (text: string): string => {
  // CRITICAL FIX: Apply multiple RTL control characters to text
  return forceRtlDirection(text);
};
