
/**
 * Helper function to ensure Hebrew text is properly displayed in PDF
 * Using standard encoding for better compatibility
 */
export const encodeHebrewText = (text: string): string => {
  if (!text) return '';
  
  // Simply return the text - pdfMake will handle RTL when font and rtl:true are set
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
