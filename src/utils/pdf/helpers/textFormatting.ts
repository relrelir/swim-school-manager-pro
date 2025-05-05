
/**
 * Utility functions for text formatting in PDFs
 * Handles bidirectional text (RTL Hebrew and LTR numbers)
 */

/**
 * Format text for PDF display with appropriate direction markers
 * - Hebrew text works correctly with the global RTL setting
 * - Numbers need special handling with LTR marks to ensure correct display in RTL context
 */
export const formatPdfField = (text: string | number): string => {
  if (text === null || text === undefined) return '';
  
  const textStr = String(text);
  
  // Check if the text contains Hebrew characters
  const containsHebrew = /[\u0590-\u05FF]/.test(textStr);
  
  // Check if the text contains only numbers, spaces, hyphens, and typical numeric symbols
  const isNumeric = /^[\d\s\-+()\/\.,:]+$/.test(textStr);
  
  // In a globally RTL document:
  // - Hebrew text already displays correctly (RTL)
  // - Numbers need explicit LTR marks to prevent reversal
  if (isNumeric && !containsHebrew) {
    // Use LRM (U+200E) for numbers to ensure they display correctly in RTL context
    return '\u200E' + textStr + '\u200E';
  } else {
    // Hebrew text or mixed content - already displays correctly with global RTL
    return textStr;
  }
};

/**
 * Force LTR direction for numbers, IDs, dates regardless of content
 */
export const forceLtrDirection = (text: string | number): string => {
  if (text === null || text === undefined) return '';
  
  const textStr = String(text);
  
  // Use LRM (U+200E) to ensure proper LTR display of numeric content in RTL context
  return '\u200E' + textStr + '\u200E';
};

/**
 * Force RTL direction for Hebrew text regardless of content
 */
export const forceRtlDirection = (text: string): string => {
  if (text === null || text === undefined) return '';
  
  // Hebrew text already displays correctly in global RTL - no special handling needed
  return text;
};

/**
 * Special formatting for table cells
 */
export const formatTableCell = (text: string | number): string => {
  return formatPdfField(text);
};
