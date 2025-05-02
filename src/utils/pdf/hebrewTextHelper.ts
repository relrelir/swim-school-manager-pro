
/**
 * Helper function to ensure Hebrew text is properly displayed in PDF
 * Since we're using a proper Hebrew font and RTL support, we just return the text as-is
 */
export const encodeHebrewText = (text: string): string => {
  if (!text) return '';
  return text;
};

/**
 * Helper function for any special text treatments needed
 */
export const prepareRtlText = (text: string): string => {
  if (!text) return '';
  return text;
};

/**
 * Helper function to check if text contains Hebrew characters
 */
export const containsHebrew = (text: string): boolean => {
  if (!text) return false;
  
  // Hebrew Unicode range: \u0590-\u05FF
  const hebrewRegex = /[\u0590-\u05FF]/;
  return hebrewRegex.test(text);
};

/**
 * Get proper text alignment based on content
 */
export const getTextAlignment = (text: string): 'right' | 'left' | 'center' => {
  if (containsHebrew(text)) {
    return 'right'; // Hebrew text aligned right
  }
  return 'left'; // Default alignment for non-Hebrew
};
