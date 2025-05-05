
import { UserOptions } from 'jspdf-autotable';
import { didParseCell, willDrawCell } from './cellHooks';

/**
 * Returns the configuration options for data tables
 */
export const getTableConfig = (startY: number): UserOptions => ({
  startY,
  tableLineWidth: 0.5,
  margin: { top: 10, right: 15, bottom: 10, left: 15 },
  styles: { 
    font: 'Alef',
    overflow: 'linebreak',
    cellPadding: 4,
    lineWidth: 0.1,
    halign: 'right', // Default alignment for Hebrew context
    valign: 'middle', // Center text vertically
    minCellWidth: 20, // Ensure minimum width for cells
    fontStyle: 'normal',
  },
  headStyles: {
    fillColor: [200, 200, 200],
    textColor: [0, 0, 0],
    fontStyle: 'normal',
    halign: 'right', // Right alignment for Hebrew headers
  },
  bodyStyles: {
    fontStyle: 'normal',
  },
  theme: 'grid' as 'grid',
  
  // Process cells before rendering 
  didParseCell,
  
  // Final adjustments to cell rendering
  willDrawCell,
});

/**
 * Returns the configuration options for plain text tables
 */
export const getPlainTextTableConfig = (startY: number): UserOptions => ({
  startY,
  tableLineWidth: 0.1,
  margin: { top: 10, right: 15, bottom: 10, left: 15 },
  styles: { 
    font: 'Alef',
    overflow: 'linebreak',
    cellPadding: 3,
    halign: 'right', // Default alignment for Hebrew context
    valign: 'middle', // Center text vertically
  },
  theme: 'plain' as 'plain',
  
  // Process cells before rendering
  didParseCell,
  
  // Final adjustments to cell rendering
  willDrawCell,
});
