
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
  // Process each cell individually with enhanced content-aware handling
  const processedData = data.map(row => 
    row.map(cell => {
      const processed = processCellContent(cell);
      return processed.text;
    })
  );
  
  // Get plain text table configuration
  const tableConfig = getPlainTextTableConfig(startY);
  
  try {
    autoTable(pdf, {
      ...tableConfig,
      body: processedData,
    });
  } catch (error) {
    // Try with default font as fallback
    tableConfig.styles.font = 'helvetica';
    autoTable(pdf, {
      ...tableConfig,
      body: processedData,
    });
  }

  // Return the new y position after the table
  let finalY = 0;
  try {
    finalY = (pdf as any).lastAutoTable.finalY + 5;
  } catch (error) {
    finalY = startY + 30; // Default fallback value
  }
  
  return finalY;
};
