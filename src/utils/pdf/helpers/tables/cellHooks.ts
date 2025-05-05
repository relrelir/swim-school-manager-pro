
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
 * Simplified to use only the essential RTL/LTR markers
 */
export function willDrawCell(data: CellHookData): void {
  // Add any final adjustments to cell drawing if needed
  const cell = data.cell;
  if (!cell || !cell.text) return;
  
  const cellContent = Array.isArray(cell.text) ? cell.text.join('') : cell.text;
  
  // For ID numbers, use simple LTR marker
  if (/^\d{5,9}$/.test(cellContent)) {
    cell.text = [`\u200E${cellContent}`]; // LRM (Left-to-Right Mark)
  }
  // For Hebrew text cells, use simple RTL marker
  else if (/[\u0590-\u05FF]/.test(cellContent)) {
    cell.text = [`\u200F${cellContent}`]; // RLM (Right-to-Left Mark)
  }
}
