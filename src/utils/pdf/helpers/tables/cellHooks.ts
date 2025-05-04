
import { CellHookData } from 'jspdf-autotable';
import { processCellContent } from './contentProcessing';
import { containsHebrew } from '../contentDetection';

/**
 * Parse and format cells before rendering for proper display
 * Enhanced to handle Hebrew and bidirectional text better
 */
export function didParseCell(data: CellHookData): void {
  // Get the cell's content
  const cell = data.cell;
  if (!cell || !cell.text) return;
  
  const cellContent = Array.isArray(cell.text) ? cell.text.join('') : cell.text;
  
  // Process cell and detect content type for proper alignment
  const isHebrewContent = containsHebrew(cellContent);
  const processed = processCellContent(cellContent);
  
  // Set alignment based on content type
  if (processed.isCurrency || /^\d+$/.test(cellContent) || !isHebrewContent) {
    // Numbers, currency, English: left-aligned
    cell.styles.halign = 'left';
  } else {
    // Hebrew text: right-aligned
    cell.styles.halign = 'right';
  }
  
  // Debug info
  console.log(`Cell "${cellContent}" processed with halign=${cell.styles.halign}, Hebrew=${isHebrewContent}`);
}

/**
 * Final adjustments to cell during drawing
 */
export function willDrawCell(data: CellHookData): void {
  // Special handling for specific cases if needed
}
