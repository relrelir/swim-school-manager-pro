
/**
 * Helper function to ensure Hebrew text is properly displayed in PDF
 * Using standard encoding for better compatibility with David font
 */
export const encodeHebrewText = (text: string): string => {
  if (!text) return '';
  
  // Simply return the text - jsPDF will handle RTL with David font
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
 */
export const prepareRtlText = (text: string): string => {
  return text || '';
};
