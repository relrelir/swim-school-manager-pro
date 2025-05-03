
/**
 * Helper functions for handling Hebrew text and mixed content in PDFs
 */

// Detect if text contains English characters or numbers only
export const isEnglishOrNumber = (text: string): boolean => {
  if (!text) return false;
  // Match English letters, numbers, and common punctuation only
  return /^[a-zA-Z0-9\s\-\.\/\(\)\+\:]+$/.test(text);
};

// Detect if text contains numbers only (for phone numbers, ID numbers)
export const isNumberOnly = (text: string): boolean => {
  if (!text) return false;
  // Match only digits and common number formatting characters
  return /^[0-9\s\-\.\/]+$/.test(text);
};

// Detect if text is a date in common formats
export const isDateFormat = (text: string): boolean => {
  if (!text) return false;
  // Match common date formats (dd/mm/yyyy, etc.)
  return /^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(text);
};

// Detect if text is a phone number format
export const isPhoneFormat = (text: string): boolean => {
  if (!text) return false;
  // Match common Israeli phone formats
  return /^0\d{1,2}[\-\s]?\d{7,8}$/.test(text);
};

/**
 * Process text to ensure correct display direction in PDF
 * - Apply enhanced directional control for English/numbers in RTL context
 * - Uses embedding characters for stronger directional overrides
 */
export const processTextDirection = (text: string): string => {
  if (!text) return '';
  
  // For numbers, dates, phone numbers, and English text, we need strong LTR direction
  if (isNumberOnly(text) || isDateFormat(text) || isPhoneFormat(text) || isEnglishOrNumber(text)) {
    // Use stronger directional control:
    // - LRE: Left-to-Right Embedding (U+202A) - starts an LTR embedding level
    // - PDF: Pop Directional Formatting (U+202C) - restores the previous directional state
    // - LRM: Left-to-Right Mark (U+200E) - invisible marker with LTR directionality
    
    // Add surrounding spaces to improve isolation if needed
    const spacedText = text.trim();
    
    // Triple layer of protection:
    // 1. LRE to start an LTR embedding level
    // 2. LRM to reinforce LTR direction at both boundaries
    // 3. PDF to end the embedding level
    return `\u202A\u200E${spacedText}\u200E\u202C`;
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
 * Apply strong directional control for specific content types
 * Additional wrapper for formatters to ensure correct display
 */
export const applyStrongDirectionalControl = (text: string): string => {
  if (!text) return '';
  
  // The strongest directional control for LTR content in RTL context:
  // Multiple embedding levels and directional marks
  
  // Check if this is a numeric/English content that needs LTR protection
  if (isNumberOnly(text) || isDateFormat(text) || isPhoneFormat(text) || isEnglishOrNumber(text)) {
    // LRI: Left-to-Right Isolate (U+2066) - starts an LTR isolate
    // PDI: Pop Directional Isolate (U+2069) - ends the isolate
    // FSI: First Strong Isolate (U+2068) - isolates and determines direction from first strong character
    
    // Multiple layers of protection for absolutely critical LTR content
    return `\u202A\u2066\u200E${text}\u200E\u2069\u202C`;
  }
  
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
