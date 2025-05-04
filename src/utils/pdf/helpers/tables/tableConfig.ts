
import { UserOptions } from 'jspdf-autotable';
import { didParseCell, willDrawCell } from './cellHooks';

/**
 * Returns the configuration options for data tables
 */
export const getTableConfig = (startY: number): UserOptions => ({
  startY,
  styles: { 
    font: 'Alef',
    overflow: 'linebreak',
    cellPadding: 4,
    lineWidth: 0.1,
    halign: 'right', // Default alignment for Hebrew context
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
  
  // Process cells before rendering to handle bidirectional text
  didParseCell,
  
  // Additional hook to handle cell rendering
  willDrawCell,
});

/**
 * Returns the configuration options for plain text tables
 */
export const getPlainTextTableConfig = (startY: number): UserOptions => ({
  startY,
  styles: { 
    font: 'Alef',
    overflow: 'linebreak',
    cellPadding: 3,
    halign: 'right',
  },
  theme: 'plain' as 'plain',
  
  // Process cells before rendering
  didParseCell,
});
