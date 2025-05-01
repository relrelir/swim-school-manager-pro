
/**
 * Helper function to ensure Hebrew text is properly displayed in PDF
 */
export const encodeHebrewText = (text: string): string => {
  if (!text) return '';
  
  // Return the text directly - we're relying on jsPDF's RTL support
  // The setR2L(true) setting in the PDF creation handles the direction
  return text;
};

/**
 * Helper function for RTL text in tables to ensure correct display
 */
export const prepareRtlText = (text: string): string => {
  if (!text) return '';
  return text;
};
