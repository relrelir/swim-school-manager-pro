
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { processCellContent } from './contentProcessing';
import { getPlainTextTableConfig } from './tableConfig';

/**
 * Creates a plain text table (without grid lines) with improved RTL support
 */
export const createPlainTextTable = (
  pdf: jsPDF, 
  data: (string | number)[][], 
  startY: number
): number => {
  console.log(`Creating plain text table at y=${startY} with ${data.length} rows`);
  
  // Process each cell with better RTL/LTR handling
  const processedData = data.map(row => 
    row.map(cell => {
      const processed = processCellContent(cell);
      return processed.text;
    })
  );
  
  // Get more compact table configuration
  const tableConfig = getPlainTextTableConfig(startY);
  tableConfig.styles = {
    ...tableConfig.styles,
    cellPadding: 2, // Reduce cell padding for compactness
    fontSize: 10,   // Smaller font for more text
  };
  
  // Use tighter margins to save space
  const tableOptions = {
    ...tableConfig,
    body: processedData,
    margin: { top: 3, right: 15, bottom: 3, left: 15 },
  };
  
  try {
    autoTable(pdf, tableOptions);
  } catch (error) {
    console.error("Error creating plain text table:", error);
    // Try with default font as fallback
    tableOptions.styles.font = 'helvetica';
    autoTable(pdf, tableOptions);
  }

  // Return the new y position after the table
  let finalY = 0;
  try {
    finalY = (pdf as any).lastAutoTable.finalY + 2; // Even more reduced spacing
    console.log(`Plain text table created, new Y position: ${finalY}`);
  } catch (error) {
    console.error("Error getting finalY for plain table, using default value:", error);
    finalY = startY + 25; // Smaller default value
  }
  
  return finalY;
};
