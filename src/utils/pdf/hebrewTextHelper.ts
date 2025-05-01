
/**
 * Helper function to ensure Hebrew text is properly displayed in PDF
 * Using standard encoding for better compatibility
 */
export const encodeHebrewText = (text: string): string => {
  if (!text) return '';
  
  // Make sure the text is properly encoded for RTL display
  return text;
};

/**
 * Legacy helper function kept for backward compatibility
 * No need to reverse text when RTL is properly set in the PDF
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

/**
 * Ensures text is properly displayed in RTL format within PDF
 * For autotable and other components
 */
export const formatHebrewPdfText = (text: string | number): string => {
  if (text === null || text === undefined) return '';
  return String(text);
};
