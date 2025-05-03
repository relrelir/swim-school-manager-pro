
/**
 * Helper function to ensure Hebrew text is properly displayed in PDF
 * Using standard encoding for better compatibility with proper RTL configuration
 */
export const encodeHebrewText = (text: string): string => {
  if (!text) return '';
  
  // Simply return the original text - the PDF is configured for RTL
  return text;
};

/**
 * Legacy helper function kept for backward compatibility
 * No reversal needed with proper RTL support
 */
export const reverseText = (text: string): string => {
  return text || '';
};

/**
 * Helper function specifically for tables
 * No special preparation needed with proper font and RTL configuration
 */
export const prepareRtlText = (text: string): string => {
  return text || '';
};
