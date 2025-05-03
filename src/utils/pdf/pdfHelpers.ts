
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { configureDocumentStyle } from './pdfConfig';
import { processTextDirection, forceLtrDirection } from './hebrewTextHelper';

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
  // Process date with stronger LTR control
  pdf.text(forceLtrDirection(date), pdf.internal.pageSize.width - 20, 10, { align: 'right' });
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
 * Determine if a cell content is likely LTR content (numbers, English, etc.)
 */
const isLtrContent = (content: string | number): boolean => {
  if (typeof content === 'number') return true;
  if (!content) return false;
  
  const text = String(content);
  // Check if content is likely English or purely numeric
  return /^[\w\s\d\-\.\/\(\)\+\:]*$/.test(text) && !/[\u0590-\u05FF]/.test(text);
};

/**
 * Creates a data table in the PDF document with enhanced RTL/LTR support
 */
export const createDataTable = (
  pdf: jsPDF, 
  data: (string | number)[][], 
  startY: number, 
  hasHeader: boolean = false
): number => {
  console.log(`Creating data table at y=${startY} with ${data.length} rows`);
  console.log("First row sample:", JSON.stringify(data[0]));
  
  // Process each cell individually based on content type
  const processedData = data.map(row => 
    row.map(cell => {
      // For numbers and English text, use strong LTR controls
      if (typeof cell === 'number' || isLtrContent(String(cell))) {
        return forceLtrDirection(String(cell));
      }
      // For Hebrew or mixed content, use regular processing
      return typeof cell === 'string' ? processTextDirection(cell) : cell;
    })
  );

  // Log a sample of the processed data for debugging
  console.log("Processed sample cell:", 
    processedData[0][0] && typeof processedData[0][0] === 'string' 
      ? processedData[0][0].replace(/[\u0000-\u001F\u007F-\u009F\u200E\u200F\u202A-\u202E]/g, c => `\\u${c.charCodeAt(0).toString(16).padStart(4, '0')}`)
      : processedData[0][0]
  );
  
  // Enhanced table configuration to better handle bidirectional text
  const tableConfig: any = {
    startY,
    styles: { 
      font: 'Alef',
      overflow: 'linebreak',
      cellPadding: 4,
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [200, 200, 200],
      textColor: [0, 0, 0],
      fontStyle: 'normal',
    },
    bodyStyles: {
      fontStyle: 'normal',
    },
    theme: 'grid',
    willDrawCell: function(data: any) {
      // Detect cell content type to apply appropriate alignment
      const cell = data.cell;
      if (cell && cell.text) {
        // Check if the cell content appears to be LTR (English, numbers)
        const cellText = Array.isArray(cell.text) ? cell.text.join('') : cell.text;
        if (isLtrContent(cellText)) {
          // For LTR content, use left alignment
          cell.styles.halign = 'left';
        } else {
          // For RTL content, use right alignment
          cell.styles.halign = 'right';
        }
      }
    },
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
 */
export const createPlainTextTable = (
  pdf: jsPDF, 
  data: (string | number)[][], 
  startY: number
): number => {
  console.log(`Creating plain text table at y=${startY} with ${data.length} rows`);
  
  // Process each cell individually based on content type
  const processedData = data.map(row => 
    row.map(cell => {
      // For numbers and English text, use strong LTR controls
      if (typeof cell === 'number' || isLtrContent(String(cell))) {
        return forceLtrDirection(String(cell));
      }
      // For Hebrew or mixed content, use regular processing
      return typeof cell === 'string' ? processTextDirection(cell) : cell;
    })
  );
  
  // Enhanced table configuration for plain text tables
  const tableConfig: any = {
    startY,
    styles: { 
      font: 'Alef',
      overflow: 'linebreak',
      cellPadding: 3,
    },
    theme: 'plain',
    willDrawCell: function(data: any) {
      // Detect cell content type to apply appropriate alignment
      const cell = data.cell;
      if (cell && cell.text) {
        // Check if the cell content appears to be LTR (English, numbers)
        const cellText = Array.isArray(cell.text) ? cell.text.join('') : cell.text;
        if (isLtrContent(cellText)) {
          // For LTR content, use left alignment
          cell.styles.halign = 'left';
        } else {
          // For RTL content, use right alignment
          cell.styles.halign = 'right';
        }
      }
    },
  };
  
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
