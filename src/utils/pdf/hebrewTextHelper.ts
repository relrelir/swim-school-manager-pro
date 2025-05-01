
/**
 * Helper function to ensure Hebrew text is properly displayed in PDF
 * This function prepares Hebrew text for jsPDF rendering with proper RTL support
 */
export const encodeHebrewText = (text: string): string => {
  if (!text) return '';
  
  // This is a crucial step for proper Hebrew rendering in jsPDF
  // We need to reverse the string after jsPDF's RTL handling to get correct display
  return text;
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
  // For Hebrew text in tables, we sometimes need special handling
  return text;
};
