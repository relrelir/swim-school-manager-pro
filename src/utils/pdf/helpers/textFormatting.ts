
/**
 * Utility functions for text formatting in PDFs
 * Handles bidirectional text (RTL Hebrew and LTR numbers)
 */

/**
 * Format text for PDF display with appropriate direction markers
 * - Hebrew text gets RTL marks (U+200F)
 * - Numbers get LTR marks (U+200E)
 */
export const formatPdfField = (text: string | number): string => {
  if (text === null || text === undefined) return '';
  
  const textStr = String(text);
  
  // Check if the text contains only numbers, spaces, hyphens, and typical numeric symbols
  const isNumeric = /^[\d\s\-+()\/\.,:]+$/.test(textStr);
  
  // Use LRM (U+200E) for numbers and RLM (U+200F) for Hebrew
  const marker = isNumeric ? '\u200E' : '\u200F';
  
  // Wrap text with appropriate markers at start and end
  return marker + textStr + marker;
};

/**
 * Force LTR direction for numbers, IDs, dates regardless of content
 */
export const forceLtrDirection = (text: string | number): string => {
  if (text === null || text === undefined) return '';
  
  const textStr = String(text);
  
  // Always use LRM (U+200E) markers
  return '\u200E' + textStr + '\u200E';
};

/**
 * Force RTL direction for Hebrew text regardless of content
 */
export const forceRtlDirection = (text: string): string => {
  if (text === null || text === undefined) return '';
  
  // Always use RLM (U+200F) markers
  return '\u200F' + text + '\u200F';
};

/**
 * Special formatting for table cells
 */
export const formatTableCell = (text: string | number): string => {
  return formatPdfField(text);
};
