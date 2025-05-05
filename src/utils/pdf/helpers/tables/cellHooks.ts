
import { CellHookData } from 'jspdf-autotable';
import { processCellContent } from './contentProcessing';

/**
 * Parses and formats cells before rendering to handle bidirectional text
 * CRITICAL FIX: Respect Hebrew text direction with stronger RTL markers
 */
export function didParseCell(data: CellHookData): void {
  // Get the cell's content and detect its type
  const cell = data.cell;
  if (!cell || !cell.text) return;
  
  const cellContent = Array.isArray(cell.text) ? cell.text.join('') : cell.text;
  const processed = processCellContent(cellContent);
  
  // CRITICAL FIX: Set cell content with improved RTL handling
  cell.text = Array.isArray(processed.text) ? processed.text : [processed.text];
  
  // CRITICAL FIX: Apply appropriate alignment based on content type
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
 * CRITICAL FIX: Apply stronger RTL isolation for Hebrew text with multiple marker types
 */
export function willDrawCell(data: CellHookData): void {
  // Add any final adjustments to cell drawing if needed
  const cell = data.cell;
  if (!cell || !cell.text) return;
  
  const cellContent = Array.isArray(cell.text) ? cell.text.join('') : cell.text;
  
  // CRITICAL FIX: For ID numbers, add strong LTR isolation
  if (/^\d{5,9}$/.test(cellContent)) {
    // Add explicit LTR isolation for ID numbers
    cell.text = [`\u2066${cellContent}\u2069`]; // LTR Isolate + PDI
  }
  // CRITICAL FIX: For Hebrew text cells, use MULTIPLE types of RTL markers for maximum compatibility
  else if (/[\u0590-\u05FF]/.test(cellContent)) {
    // Use maximum strength RTL isolation with multiple markers:
    // \u2067 = Right-to-Left Isolate (RLI)
    // \u061C = Arabic Letter Mark (ALM) - helps with RTL rendering
    // \u200F = Right-to-Left Mark (RLM)
    // \u2069 = Pop Directional Isolate (PDI)
    cell.text = [`\u200F\u2067\u200F${cellContent}\u200F\u2069`];
  }
}
