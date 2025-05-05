
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
  
  // Process each cell individually with enhanced content-aware handling
  const processedData = data.map(row => 
    row.map(cell => {
      const processed = processCellContent(cell);
      return processed.text;
    })
  );
  
  // Get plain text table configuration
  const tableConfig = getPlainTextTableConfig(startY);
  
  // CRITICAL FIX: Do NOT enable global RTL mode
  // Let cell-level direction markers handle text direction instead
  
  try {
    autoTable(pdf, {
      ...tableConfig,
      body: processedData,
    });
  } catch (error) {
    console.error("Error creating plain text table:", error);
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
    console.log(`Plain text table created, new Y position: ${finalY}`);
  } catch (error) {
    console.error("Error getting finalY for plain table, using default value:", error);
    finalY = startY + 30; // Default fallback value
  }
  
  return finalY;
};
