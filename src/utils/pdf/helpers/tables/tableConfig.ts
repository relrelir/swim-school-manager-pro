
import { UserOptions } from 'jspdf-autotable';
import { didParseCell, willDrawCell } from './cellHooks';

/**
 * Returns the configuration options for data tables
 * CRITICAL FIX: Properly configured for bidirectional text
 */
export const getTableConfig = (startY: number): UserOptions => ({
  startY,
  styles: { 
    font: 'Alef',
    overflow: 'linebreak',
    cellPadding: 4,
    lineWidth: 0.1,
    halign: 'right', // Default alignment for Hebrew context
    valign: 'middle', // Center text vertically
    minCellWidth: 20, // Ensure minimum width for cells
  },
  headStyles: {
    fillColor: [200, 200, 200],
    textColor: [0, 0, 0],
    fontStyle: 'normal',
  },
  bodyStyles: {
    fontStyle: 'normal',
  },
  theme: 'grid' as 'grid',
  
  // CRITICAL FIX: Process cells before rendering to handle bidirectional text
  didParseCell,
  
  // CRITICAL FIX: Final adjustments to cell rendering with stronger RTL isolation
  willDrawCell,
});

/**
 * Returns the configuration options for plain text tables
 * CRITICAL FIX: Properly configured for bidirectional text
 */
export const getPlainTextTableConfig = (startY: number): UserOptions => ({
  startY,
  styles: { 
    font: 'Alef',
    overflow: 'linebreak',
    cellPadding: 3,
    halign: 'right', // Default alignment for Hebrew context
    valign: 'middle', // Center text vertically
  },
  theme: 'plain' as 'plain',
  
  // CRITICAL FIX: Process cells before rendering with enhanced RTL handling
  didParseCell,
  
  // CRITICAL FIX: Final adjustments to cell rendering
  willDrawCell,
});
