
import { jsPDF } from 'jspdf';
import autoTable, { UserOptions } from 'jspdf-autotable';
import { processCellContent } from './contentProcessing';
import { didParseCell, willDrawCell } from './cellHooks';
import { getTableConfig } from './tableConfig';

/**
 * Creates a data table in the PDF document with enhanced RTL/LTR support
 * for mixed content environments
 */
export const createDataTable = (
  pdf: jsPDF, 
  data: (string | number)[][], 
  startY: number, 
  hasHeader: boolean = false
): number => {
  console.log(`Creating data table at y=${startY} with ${data.length} rows`);
  if (data.length > 0) {
    console.log("First row sample:", JSON.stringify(data[0]));
  }
  
  // Process data with advanced content-aware handling
  const processedData = data.map(row => 
    row.map(cell => {
      const processed = processCellContent(cell);
      return processed.text;
    })
  );

  // Get table configuration with direction control
  const tableConfig = getTableConfig(startY);
  
  // CRITICAL FIX: Enable RTL mode before creating table
  pdf.setR2L(true);
  
  if (hasHeader) {
    const headers = processedData[0];
    const body = processedData.slice(1);
    
    try {
      console.log("Creating table with header");
      autoTable(pdf, {
        ...tableConfig,
        head: [headers],
        body: body,
      });
    } catch (error) {
      console.error("Error creating table with header:", error);
      // Try with default font as fallback
      tableConfig.styles.font = 'helvetica';
      autoTable(pdf, {
        ...tableConfig,
        head: [headers],
        body: body,
      });
    }
  } else {
    try {
      console.log("Creating table without header");
      autoTable(pdf, {
        ...tableConfig,
        body: processedData,
      });
    } catch (error) {
      console.error("Error creating table without header:", error);
      // Try with default font as fallback
      tableConfig.styles.font = 'helvetica';
      autoTable(pdf, {
        ...tableConfig,
        body: processedData,
      });
    }
  }
  
  // CRITICAL FIX: Disable RTL mode after creating table
  pdf.setR2L(false);

  // Return the new y position after the table
  let finalY = 0;
  try {
    finalY = (pdf as any).lastAutoTable.finalY + 5;
    console.log(`Table created, new Y position: ${finalY}`);
  } catch (error) {
    console.error("Error getting finalY, using default value:", error);
    finalY = startY + 50; // Default fallback value
  }
  
  return finalY;
};
