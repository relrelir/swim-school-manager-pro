
/**
 * Helper function to ensure Hebrew text is properly displayed in PDF
 * With proper RTL and font configuration, we don't need to do special encoding
 */
export const encodeHebrewText = (text: string): string => {
  if (!text) return '';
  
  // With proper RTL configuration, we can just return the text as-is
  return text;
};

/**
 * Legacy helper function kept for backward compatibility 
 * No longer needed to reverse text with proper RTL support
 */
export const reverseText = (text: string): string => {
  return text || '';
};

/**
 * Helper function specifically for tables to ensure RTL text is displayed correctly
 * No special handling needed with proper RTL configuration
 */
export const prepareRtlText = (text: string): string => {
  return text || '';
};
