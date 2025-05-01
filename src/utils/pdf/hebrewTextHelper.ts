
/**
 * Helper function to ensure Hebrew text is properly encoded for PDF
 * We don't need special encoding with jsPDF's built-in RTL support
 */
export const encodeHebrewText = (text: string): string => {
  return text;
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
  return text;
};
