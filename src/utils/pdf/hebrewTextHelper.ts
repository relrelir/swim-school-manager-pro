
/**
 * Helper function to ensure Hebrew text is properly displayed in PDF with David font
 * Using standard encoding for better compatibility
 */
export const encodeHebrewText = (text: string): string => {
  if (!text) return '';
  
  // With David font properly installed, we can just return the Hebrew text directly
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
 * with David font in PDFs
 */
export const prepareRtlText = (text: string): string => {
  return text || '';
};
