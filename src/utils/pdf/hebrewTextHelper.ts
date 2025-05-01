
/**
 * Helper function to ensure Hebrew text is properly encoded for PDF
 */
export const encodeHebrewText = (text: string): string => {
  return text;  // The PDF library should handle encoding correctly with the proper font
};

/**
 * Helper function to reverse the order of characters in a string
 * This may be needed for some special cases when RTL doesn't work correctly
 */
export const reverseText = (text: string): string => {
  return text.split('').reverse().join('');
};

/**
 * Helper function specifically for tables to ensure RTL text is displayed correctly
 */
export const prepareRtlText = (text: string): string => {
  // Most of the time the PDF library with proper RTL setting handles this correctly
  return text;
};
