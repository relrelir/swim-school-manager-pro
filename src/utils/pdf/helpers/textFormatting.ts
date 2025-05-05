
/**
 * Utility functions for formatting text in PDFs with proper directional markers
 */

/**
 * Format text for PDF display with appropriate directional markers
 * @param text The text to format
 * @param type The type of content ('text' for RTL Hebrew content, 'number' for LTR numeric content)
 * @returns Properly formatted text with direction markers
 */
export function formatPdfField(text: string | number, type: 'text' | 'number'): string {
  // Convert to string if needed
  const content = String(text || '');
  
  if (type === 'number') {
    // LRM (Left-to-Right Mark) for numeric content
    return '\u200E' + content + '\u200E';
  } else {
    // RLM (Right-to-Left Mark) for Hebrew text
    return '\u200F' + content + '\u200F';
  }
}

/**
 * Format Hebrew text with RTL markers
 */
export function formatHebrewText(text: string): string {
  return formatPdfField(text, 'text');
}

/**
 * Format numeric content with LTR markers
 */
export function formatNumericContent(text: string | number): string {
  return formatPdfField(text, 'number');
}

/**
 * Format currency values properly
 */
export function formatCurrencyForPdf(amount: string | number): string {
  return formatPdfField(amount, 'number');
}

/**
 * Format date values properly
 */
export function formatDateForPdf(date: string): string {
  return formatPdfField(date, 'number');
}

/**
 * Format ID numbers properly
 */
export function formatIdForPdf(id: string): string {
  return formatPdfField(id, 'number');
}

/**
 * Format phone numbers properly
 */
export function formatPhoneForPdf(phone: string): string {
  return formatPdfField(phone, 'number');
}
