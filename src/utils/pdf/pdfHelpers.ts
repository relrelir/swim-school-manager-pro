import { jsPDF } from 'jspdf';
import autoTable, { UserOptions, CellHookData } from 'jspdf-autotable';
import { configureDocumentStyle } from './pdfConfig';
import { processTextDirection, forceLtrDirection, processTableCellDirection, forceRtlDirection } from './hebrewTextHelper';
import { formatCurrencyForTable } from '@/utils/formatters';

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
  
  // Default to non-RTL initially - we'll handle RTL explicitly for each text element
  pdf.setR2L(false);
  
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
  
  // Hebrew title should be RTL
  pdf.setR2L(true);
  pdf.text(title, pdf.internal.pageSize.width / 2, 20, { align: 'center' });
  pdf.setR2L(false); // Reset for subsequent operations
};

/**
 * Adds the current date to the PDF document
 */
export const addPdfDate = (pdf: jsPDF, date: string): void => {
  console.log(`Adding PDF date: "${date}"`);
  configureDocumentStyle(pdf);
  pdf.setFontSize(10);
  
  // Date is always LTR (numbers)
  pdf.setR2L(false);
  // Use explicit LTR for date with strong controls
  pdf.text(forceLtrDirection(date), pdf.internal.pageSize.width - 20, 10, { align: 'right' });
};

/**
 * Adds a section title to the PDF document
 */
export const addSectionTitle = (pdf: jsPDF, title: string, y: number): void => {
  console.log(`Adding section title: "${title}" at y=${y}`);
  configureDocumentStyle(pdf);
  pdf.setFontSize(14);
  
  // Hebrew section title should be RTL
  pdf.setR2L(true);
  pdf.text(title, pdf.internal.pageSize.width - 20, y, { align: 'right' });
  pdf.setR2L(false); // Reset for subsequent operations
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
 * Specialized function to detect currency values in table cells
 */
const isCurrencyValue = (content: string | number): boolean => {
  if (typeof content === 'number') return false;
  if (!content) return false;
  
  const text = String(content);
  // Check for currency patterns (₪, ILS, NIS) with numbers
  return /₪|[Ss][Hh][Ee][Kk][Ee][Ll]|ILS|NIS/i.test(text) && /\d/.test(text);
};

/**
 * Enhanced processing for specific cell types with specialized direction control for tables
 */
const processTableCell = (cell: any): string => {
  if (!cell) return '';
  const content = String(cell);
  
  // Debug log for currency detection
  if (isCurrencyValue(content)) {
    console.log(`Cell detected as currency: "${content}"`);
    return processTableCellDirection(content);
  }
  
  // Special cases with direction control specific for tables
  if (/^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(content)) {
    // Date format
    console.log(`Cell detected as date: "${content}"`);
    return forceLtrDirection(content);
  } else if (/^[0-9\s\-\.]+$/.test(content)) {
    // Pure number (ID, phone, etc)
    console.log(`Cell detected as number: "${content}"`);
    return forceLtrDirection(content);
  } else if (isLtrContent(content)) {
    // Other LTR content
    console.log(`Cell detected as LTR: "${content}"`);
    return forceLtrDirection(content);
  } else if (/[\u0590-\u05FF]/.test(content)) {
    // Content contains Hebrew - needs RTL in tables specifically
    console.log(`Cell detected as Hebrew: "${content}"`);
    return forceRtlDirection(content);
  } else {
    // Default case - use standard processing
    return processTextDirection(content);
  }
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
  
  // Process each cell with enhanced content-aware handling for tables
  const processedData = data.map(row => 
    row.map(cell => {
      // Special handling for numeric values that should be formatted as currency
      if (typeof cell === 'number' && String(cell).includes('.')) {
        // This is likely a monetary value, format it specifically for tables
        return formatCurrencyForTable(cell);
      }
      return processTableCell(cell);
    })
  );

  // Log a sample of the processed data for debugging
  console.log("Processed sample cell:", 
    processedData[0][0] && typeof processedData[0][0] === 'string' 
      ? processedData[0][0].replace(/[\u0000-\u001F\u007F-\u009F\u200E\u200F\u202A-\u202E]/g, c => `\\u${c.charCodeAt(0).toString(16).padStart(4, '0')}`)
      : processedData[0][0]
  );
  
  // Enhanced table configuration with cell-specific direction handling
  const tableConfig: UserOptions = {
    startY,
    styles: { 
      font: 'Alef',
      overflow: 'linebreak',
      cellPadding: 4,
      lineWidth: 0.1,
      halign: 'right', // default alignment for Hebrew
    },
    headStyles: {
      fillColor: [200, 200, 200],
      textColor: [0, 0, 0],
      fontStyle: 'normal',
    },
    bodyStyles: {
      fontStyle: 'normal',
    },
    theme: 'grid' as 'grid', // Explicitly cast to valid ThemeType
    willDrawCell: function(data: CellHookData) {
      // Detect cell content type to apply appropriate alignment and direction
      const cell = data.cell;
      if (cell && cell.text) {
        // Check content type
        const cellText = Array.isArray(cell.text) ? cell.text.join('') : cell.text;
        
        // Set alignment based on content
        if (/[\u0590-\u05FF]/.test(cellText) && !/₪/.test(cellText)) {
          // Hebrew text without currency symbols - right align
          cell.styles.halign = 'right';
        } else if (/₪/.test(cellText) || /ILS/.test(cellText)) {
          // Currency values - use right alignment but with special handling
          cell.styles.halign = 'right';
        } else if (/\d+/.test(cellText) || /[a-zA-Z]/.test(cellText)) {
          // Numbers or English text - use left alignment
          cell.styles.halign = 'left'; 
        } else {
          // Default to right alignment for anything else
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
  
  // Process each cell individually with enhanced content-aware handling for tables
  const processedData = data.map(row => 
    row.map(cell => {
      // Special handling for numeric values that should be formatted as currency
      if (typeof cell === 'number' && String(cell).includes('.')) {
        return formatCurrencyForTable(cell);
      }
      return processTableCell(cell);
    })
  );
  
  // Enhanced table configuration for plain text tables
  const tableConfig: UserOptions = {
    startY,
    styles: { 
      font: 'Alef',
      overflow: 'linebreak',
      cellPadding: 3,
      halign: 'right', // default for Hebrew
    },
    theme: 'plain' as 'plain', // Explicitly cast to valid ThemeType
    willDrawCell: function(data: CellHookData) {
      // Detect cell content type to apply appropriate alignment
      const cell = data.cell;
      if (cell && cell.text) {
        // Check if the cell content appears to be LTR (English, numbers)
        const cellText = Array.isArray(cell.text) ? cell.text.join('') : cell.text;
        
        // Set alignment based on content
        if (/[\u0590-\u05FF]/.test(cellText) && !/₪/.test(cellText)) {
          // Hebrew text without currency symbols - right align
          cell.styles.halign = 'right';
        } else if (/₪/.test(cellText) || /ILS/.test(cellText)) {
          // Currency values - use right alignment but with special handling
          cell.styles.halign = 'right';
        } else if (/\d+/.test(cellText) || /[a-zA-Z]/.test(cellText)) {
          // Numbers or English text - use left alignment
          cell.styles.halign = 'left'; 
        } else {
          // Default to right alignment for anything else
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
