
/**
 * Helper function to ensure Hebrew text is properly displayed in PDF
 * This function prepares Hebrew text for jsPDF rendering with proper RTL support
 */
export const encodeHebrewText = (text: string): string => {
  if (!text) return '';
  
  // For jsPDF with setR2L(true), we need to reverse the text to ensure correct display
  return reverseText(text);
};

/**
 * Helper function to reverse the order of characters in a string
 * This is needed because jsPDF's RTL support sometimes needs additional help
 */
export const reverseText = (text: string): string => {
  if (!text) return '';
  return text.split('').reverse().join('');
};

/**
 * Helper function specifically for tables to ensure RTL text is displayed correctly
 */
export const prepareRtlText = (text: string): string => {
  if (!text) return '';
  // For Hebrew text in tables, we need to reverse the characters
  return reverseText(text);
};
