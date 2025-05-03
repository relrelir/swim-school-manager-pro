import { jsPDF } from 'jspdf';
import autoTable, { UserOptions, CellHookData } from 'jspdf-autotable';
import { configureDocumentStyle } from './pdfConfig';
import { 
  processTextDirection, 
  forceLtrDirection, 
  processTableCellText, 
  containsHebrew, 
  forceRtlDirection
} from './hebrewTextHelper';

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
 * Detect if a cell is likely currency by checking for common currency indicators
 */
const isCurrencyCell = (cellText: string): boolean => {
  if (!cellText) return false;
  return /[₪$€£]|ILS/.test(cellText) || /^[\d,\.]+\s*(?:[₪$€£]|ILS)/.test(cellText);
};

/**
 * Process cell text based on content type for optimal table display
 */
const processCellContent = (cell: any): { text: string, isRtl: boolean, isCurrency: boolean } => {
  if (cell === null || cell === undefined) {
    return { text: '', isRtl: false, isCurrency: false };
  }
  
  const content = String(cell);
  const isHebrewContent = /[\u0590-\u05FF]/.test(content);
  const isCurrency = isCurrencyCell(content);
  
  console.log(`Processing cell: ${content}, Hebrew: ${isHebrewContent}, Currency: ${isCurrency}`);
  
  // Process by content type
  if (isCurrency) {
    if (isHebrewContent) {
      // Hebrew currency needs special handling
      return { 
        text: processTableCellText(content),
        isRtl: true,
        isCurrency: true 
      };
    } else {
      // Non-Hebrew currency
      return { 
        text: forceLtrDirection(content),
        isRtl: false,
        isCurrency: true 
      };
    }
  } else if (/^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(content)) {
    // Date format
    return { 
      text: forceLtrDirection(content),
      isRtl: false,
      isCurrency: false 
    };
  } else if (/^[0-9\s\-\.]+$/.test(content)) {
    // Pure number (ID, phone, etc)
    return { 
      text: forceLtrDirection(content),
      isRtl: false,
      isCurrency: false 
    };
  } else if (isHebrewContent) {
    // Hebrew text
    return { 
      text: forceRtlDirection(content),
      isRtl: true,
      isCurrency: false 
    };
  } else {
    // Other content (English, etc)
    return { 
      text: forceLtrDirection(content),
      isRtl: false,
      isCurrency: false 
    };
  }
};

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

  // Enhanced table configuration with better direction control
  const tableConfig: UserOptions = {
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
    didParseCell: function(data) {
      // Get the cell's content and detect its type
      const cell = data.cell;
      if (!cell || !cell.text) return;
      
      const cellContent = Array.isArray(cell.text) ? cell.text.join('') : cell.text;
      const processed = processCellContent(cellContent);
      
      // Apply appropriate alignment based on content type
      if (processed.isCurrency || !processed.isRtl) {
        cell.styles.halign = 'left';
      } else {
        cell.styles.halign = 'right';
      }
      
      // Set directionality
      if (processed.isRtl) {
        cell.styles.direction = 'rtl';
      } else {
        cell.styles.direction = 'ltr';
      }
      
      // Log what we're doing with each cell for debugging
      console.log(`Cell "${cellContent}" processed as: RTL=${processed.isRtl}, Currency=${processed.isCurrency}, Align=${cell.styles.halign}`);
    },
    
    // Additional hook to handle cell rendering
    willDrawCell: function(data: CellHookData) {
      // Add any final adjustments to cell drawing if needed
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
  
  // Enhanced configuration for plain text tables
  const tableConfig: UserOptions = {
    startY,
    styles: { 
      font: 'Alef',
      overflow: 'linebreak',
      cellPadding: 3,
      halign: 'right',
    },
    theme: 'plain' as 'plain',
    
    // Process cells before rendering
    didParseCell: function(data) {
      // Get the cell's content and detect its type
      const cell = data.cell;
      if (!cell || !cell.text) return;
      
      const cellContent = Array.isArray(cell.text) ? cell.text.join('') : cell.text;
      const processed = processCellContent(cellContent);
      
      // Apply appropriate alignment based on content type
      if (processed.isCurrency || !processed.isRtl) {
        cell.styles.halign = 'left';
      } else {
        cell.styles.halign = 'right';
      }
      
      // Set directionality
      if (processed.isRtl) {
        cell.styles.direction = 'rtl';
      } else {
        cell.styles.direction = 'ltr';
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
