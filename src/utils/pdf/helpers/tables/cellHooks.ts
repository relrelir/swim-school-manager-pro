
import { CellHookData } from 'jspdf-autotable';
import { processCellContent } from './contentProcessing';

/**
 * Parses and formats cells before rendering to handle bidirectional text
 */
export function didParseCell(data: CellHookData): void {
  // Get the cell's content and detect its type
  const cell = data.cell;
  if (!cell || !cell.text) return;
  
  const cellContent = Array.isArray(cell.text) ? cell.text.join('') : cell.text;
  const processed = processCellContent(cellContent);
  
  // Set cell content
  cell.text = Array.isArray(processed.text) ? processed.text : [processed.text];
  
  // Apply appropriate alignment based on content type
  if (/^\d{5,9}$/.test(cellContent) || processed.isNumber) {
    // ID numbers and numeric content always left-aligned
    cell.styles.halign = 'left';
  }
  // Apply appropriate alignment based on content type
  else if (processed.isCurrency || !processed.isRtl) {
    // Force left alignment for numbers, currency, and non-RTL text
    cell.styles.halign = 'left';
  } else {
    // Right alignment for Hebrew text
    cell.styles.halign = 'right';
  }
  
  // Log cell processing for debugging
  console.log(`Cell "${cellContent}" processed with halign=${cell.styles.halign}`);
}

/**
 * Hook for final adjustments to cell drawing if needed
 * Enhanced to ensure numbers are correctly displayed with strong LTR embedding
 */
export function willDrawCell(data: CellHookData): void {
  // Add any final adjustments to cell drawing if needed
  const cell = data.cell;
  if (!cell || !cell.text) return;
  
  const cellContent = Array.isArray(cell.text) ? cell.text.join('') : cell.text;
  
  // For ID numbers, use strong LTR embedding
  if (/^\d{5,9}$/.test(cellContent)) {
    cell.text = [`\u202A${cellContent}\u202C`]; // LRE + PDF (Left-to-Right Embedding with Pop Directional Formatting)
  }
  // For phone numbers, use strong LTR embedding
  else if (/^0\d{1,2}[\-\s]?\d{7,8}$/.test(cellContent)) {
    cell.text = [`\u202A${cellContent}\u202C`]; // LRE + PDF
  }
  // For numbers and numeric content, use strong LTR embedding
  else if (/^[\d\.,]+$/.test(cellContent)) {
    cell.text = [`\u202A${cellContent}\u202C`]; // LRE + PDF
  }
  // For Hebrew text cells, use RTL embedding
  else if (/[\u0590-\u05FF]/.test(cellContent)) {
    cell.text = [`\u202B${cellContent}\u202C`]; // RLE + PDF (Right-to-Left Embedding with Pop Directional Formatting)
  }
}
