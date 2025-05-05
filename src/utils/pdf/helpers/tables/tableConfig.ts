
import { UserOptions } from 'jspdf-autotable';
import { didParseCell, willDrawCell } from './cellHooks';

/**
 * Returns the configuration options for data tables
 * CRITICAL FIX: Properly configured for bidirectional text with explicit RTL settings
 */
export const getTableConfig = (startY: number): UserOptions => ({
  startY,
  // CRITICAL FIX: Add explicit direction setting
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
    // CRITICAL FIX: Add explicit direction setting
    direction: 'rtl',
    fontStyle: 'normal',
  },
  headStyles: {
    fillColor: [200, 200, 200],
    textColor: [0, 0, 0],
    fontStyle: 'normal',
    // CRITICAL FIX: Add explicit direction setting for headers
    halign: 'right',
    direction: 'rtl',
  },
  bodyStyles: {
    fontStyle: 'normal',
    // CRITICAL FIX: Add explicit direction setting for body
    direction: 'rtl',
  },
  theme: 'grid' as 'grid',
  
  // CRITICAL FIX: Process cells before rendering to handle bidirectional text
  didParseCell,
  
  // CRITICAL FIX: Final adjustments to cell rendering with stronger RTL isolation
  willDrawCell,
});

/**
 * Returns the configuration options for plain text tables
 * CRITICAL FIX: Properly configured for bidirectional text with explicit RTL settings
 */
export const getPlainTextTableConfig = (startY: number): UserOptions => ({
  startY,
  // CRITICAL FIX: Add explicit direction setting
  tableLineWidth: 0.1,
  margin: { top: 10, right: 15, bottom: 10, left: 15 },
  styles: { 
    font: 'Alef',
    overflow: 'linebreak',
    cellPadding: 3,
    halign: 'right', // Default alignment for Hebrew context
    valign: 'middle', // Center text vertically
    // CRITICAL FIX: Add explicit direction setting
    direction: 'rtl', 
  },
  theme: 'plain' as 'plain',
  
  // CRITICAL FIX: Process cells before rendering with enhanced RTL handling
  didParseCell,
  
  // CRITICAL FIX: Final adjustments to cell rendering
  willDrawCell,
});
