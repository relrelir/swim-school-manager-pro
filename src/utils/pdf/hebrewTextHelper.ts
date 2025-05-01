
/**
 * Helper function to ensure Hebrew text is properly displayed in PDF
 * With proper RTL support and font, we don't need to reverse text anymore
 */
export const encodeHebrewText = (text: string): string => {
  if (!text) return '';
  
  // With proper RTL and font setup, we can just return the text as is
  return text;
};

/**
 * Legacy helper function kept for backward compatibility
 * No longer needed with proper RTL support
 */
export const reverseText = (text: string): string => {
  if (!text) return '';
  // With proper RTL support, text reversal is no longer needed
  return text;
};

/**
 * Helper function specifically for tables to ensure RTL text is displayed correctly
 * With proper RTL support, this function is simplified
 */
export const prepareRtlText = (text: string): string => {
  if (!text) return '';
  // With proper RTL support, text preparation is no longer needed
  return text;
};
