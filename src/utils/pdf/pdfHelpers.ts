import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { configureDocumentStyle } from './pdfConfig';
import { processTextDirection, applyStrongDirectionalControl, isEnglishOrNumber, isNumberOnly, isDateFormat, isPhoneFormat } from './hebrewTextHelper';

/**
 * Creates a new PDF document with RTL support for Hebrew
 */
export const createPdf = (): jsPDF => {
  // Use the RTL PDF creation from our pdfConfig
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });
  
  // Set document to RTL
  pdf.setR2L(true);
  
  try {
    // Use Alef font
    pdf.setFont('Alef');
    console.log("Font set to Alef in createPdf");
  } catch (error) {
    console.error("Error setting Alef font in createPdf:", error);
    // Fallback to standard font
    pdf.setFont('helvetica');
  }
  
  return pdf;
};

/**
 * Adds a title to the PDF document
 */
export const addPdfTitle = (pdf: jsPDF, title: string): void => {
  console.log(`Adding PDF title: "${title}"`);
  configureDocumentStyle(pdf);
  pdf.setFontSize(20);
  pdf.text(title, pdf.internal.pageSize.width / 2, 20, { align: 'center' });
};

/**
 * Adds the current date to the PDF document
 */
export const addPdfDate = (pdf: jsPDF, date: string): void => {
  console.log(`Adding PDF date: "${date}"`);
  configureDocumentStyle(pdf);
  pdf.setFontSize(10);
  // Process date with stronger direction control
  pdf.text(applyStrongDirectionalControl(date), pdf.internal.pageSize.width - 20, 10, { align: 'right' });
};

/**
 * Adds a section title to the PDF document
 */
export const addSectionTitle = (pdf: jsPDF, title: string, y: number): void => {
  console.log(`Adding section title: "${title}" at y=${y}`);
  configureDocumentStyle(pdf);
  pdf.setFontSize(14);
  pdf.text(title, pdf.internal.pageSize.width - 20, y, { align: 'right' });
};

/**
 * Determine if a cell contains content needing LTR direction
 */
const cellNeedsLtrDirection = (cell: any): boolean => {
  // Skip non-string content
  if (typeof cell !== 'string') return false;
  
  // Check for content types that need LTR direction
  return isNumberOnly(cell) || isDateFormat(cell) || isPhoneFormat(cell) || isEnglishOrNumber(cell);
};

/**
 * Process table cell content for proper direction
 */
const processCellContent = (cell: any): any => {
  // Skip non-string content
  if (typeof cell !== 'string') return cell;
  
  // Apply stronger directional control for specific content types
  if (cellNeedsLtrDirection(cell)) {
    return applyStrongDirectionalControl(cell);
  }
  
  // Otherwise just use standard processing
  return processTextDirection(cell);
};

/**
 * Creates a data table in the PDF document with enhanced RTL/LTR support
 * With cell-level direction overrides for mixed content
 */
export const createDataTable = (
  pdf: jsPDF, 
  data: (string | number)[][], 
  startY: number, 
  hasHeader: boolean = false
): number => {
  console.log(`Creating data table at y=${startY} with ${data.length} rows`);
  console.log("First row sample:", JSON.stringify(data[0]));
  
  // Process each cell individually for proper direction control
  const processedData = data.map(row => 
    row.map(cell => processCellContent(cell))
  );
  
  // Configure individual cell styles based on content
  const cellStyles = data.map(row => 
    row.map(cell => {
      // Determine cell direction and alignment based on content
      const isLtrContent = typeof cell === 'string' && cellNeedsLtrDirection(cell);
      
      return {
        // Set explicit cell-level direction and alignment
        halign: isLtrContent ? 'left' : 'right',
        minCellWidth: isLtrContent ? 30 : undefined, // Ensure enough space for LTR content
        cellPadding: isLtrContent ? { left: 4, right: 4, top: 2, bottom: 2 } : undefined,
      };
    })
  );
  
  // Configure autotable with enhanced RTL/LTR support
  const tableConfig: any = {
    startY,
    styles: { 
      font: 'Alef',
      // Default halign, will be overridden by cell-level styles
      halign: 'right',
    },
    headStyles: {
      fillColor: [200, 200, 200],
      textColor: [0, 0, 0],
      fontStyle: 'normal',
    },
    bodyStyles: {
      fontStyle: 'normal',
    },
    // Apply cell-level direction and alignment
    willDrawCell: function(data: any) {
      const { row, column, cell } = data;
      const isLtrContent = typeof cell.raw === 'string' && cellNeedsLtrDirection(cell.raw);
      
      if (isLtrContent) {
        // Override alignment for LTR content cells
        cell.styles.halign = 'left';
      } else {
        // Ensure RTL content cells have correct alignment
        cell.styles.halign = 'right';
      }
    },
    theme: 'grid',
  };

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

/**
 * Creates a plain text table (without grid lines) with RTL support
 * With enhanced cell-level direction processing
 */
export const createPlainTextTable = (
  pdf: jsPDF, 
  data: (string | number)[][], 
  startY: number
): number => {
  console.log(`Creating plain text table at y=${startY} with ${data.length} rows`);
  
  // Process text in each cell with enhanced direction control
  const processedData = data.map(row => 
    row.map(cell => processCellContent(cell))
  );
  
  // Configure autotable with enhanced RTL/LTR support for plain text
  const tableConfig = {
    startY,
    body: processedData,
    styles: { 
      font: 'Alef',
      halign: 'right',
    },
    // Apply cell-level direction and alignment
    willDrawCell: function(data: any) {
      const { cell } = data;
      const isLtrContent = typeof cell.raw === 'string' && cellNeedsLtrDirection(cell.raw);
      
      if (isLtrContent) {
        // Override alignment for LTR content cells
        cell.styles.halign = 'left';
      } else {
        // Ensure RTL content cells have correct alignment
        cell.styles.halign = 'right';
      }
    },
    theme: 'plain',
  };
  
  try {
    autoTable(pdf, tableConfig);
  } catch (error) {
    console.error("Error creating plain text table:", error);
    // Try with default font as fallback
    tableConfig.styles.font = 'helvetica';
    autoTable(pdf, tableConfig);
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
