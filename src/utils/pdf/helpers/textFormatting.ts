
/**
 * Utility functions for text formatting in PDFs
 * Handles bidirectional text (RTL Hebrew and LTR numbers)
 */

/**
 * Format text for PDF display with appropriate direction markers
 * - Hebrew text gets RTL marks (U+200F)
 * - Numbers get LTR marks (U+200E)
 * 
 * FIXED: Now properly handles direction embedding without text inversion
 */
export const formatPdfField = (text: string | number): string => {
  if (text === null || text === undefined) return '';
  
  const textStr = String(text);
  
  // Check if the text contains only numbers, spaces, hyphens, and typical numeric symbols
  const isNumeric = /^[\d\s\-+()\/\.,:]+$/.test(textStr);
  
  if (isNumeric) {
    // For numeric content, use LTR embedding (U+202A ... U+202C) instead of just markers
    return '\u202A' + textStr + '\u202C'; 
  } else {
    // For Hebrew content, use RTL embedding (U+202B ... U+202C) instead of just markers
    return '\u202B' + textStr + '\u202C';
  }
};

/**
 * Force LTR direction for numbers, IDs, dates regardless of content
 */
export const forceLtrDirection = (text: string | number): string => {
  if (text === null || text === undefined) return '';
  
  const textStr = String(text);
  
  // Use LTR embedding (U+202A ... U+202C) instead of just markers
  return '\u202A' + textStr + '\u202C';
};

/**
 * Force RTL direction for Hebrew text regardless of content
 */
export const forceRtlDirection = (text: string): string => {
  if (text === null || text === undefined) return '';
  
  // Use RTL embedding (U+202B ... U+202C) instead of just markers
  return '\u202B' + text + '\u202C';
};

/**
 * Special formatting for table cells
 */
export const formatTableCell = (text: string | number): string => {
  return formatPdfField(text);
};
