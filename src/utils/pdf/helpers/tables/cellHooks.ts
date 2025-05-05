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
  if (/^\d{5,9}$/.test(cellContent)) {
    // ID numbers always left-aligned
    cell.styles.halign = 'left';
  }
  else if (processed.isCurrency || !processed.isRtl) {
    // Force left alignment for numbers, currency, and non-RTL text
    cell.styles.halign = 'left';
  } else {
    // Right alignment for Hebrew text
    cell.styles.halign = 'right';
  }
  
  console.log(`Cell "${cellContent}" processed with halign=${cell.styles.halign}`);
}

/**
 * Hook for final adjustments to cell drawing if needed
 * Using stronger RTL/LTR embedding characters for better direction control
 */
export function willDrawCell(data: CellHookData): void {
  // Add any final adjustments to cell drawing if needed
  const cell = data.cell;
  if (!cell || !cell.text) return;
  
  const cellContent = Array.isArray(cell.text) ? cell.text.join('') : cell.text;
  
  // For ID numbers and numeric content, use strong LTR EMBEDDING
  if (/^\d{5,9}$/.test(cellContent) || /^[\d\-\+\.]+$/.test(cellContent)) {
    // \u202A = LEFT-TO-RIGHT EMBEDDING
    // \u202C = POP DIRECTIONAL FORMATTING (to end the embedding)
    cell.text = [`\u202A${cellContent}\u202C`];
  }
  // For dates and phone numbers, also use strong LTR EMBEDDING
  else if (/^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(cellContent) || /^0\d{1,2}[\-\s]?\d{7,8}$/.test(cellContent)) {
    cell.text = [`\u202A${cellContent}\u202C`];
  }
  // For Hebrew text cells, use RTL marker
  else if (/[\u0590-\u05FF]/.test(cellContent)) {
    // Keep using simple RTL mark for Hebrew as it works correctly
    cell.text = [`\u200F${cellContent}`];
  }
}
