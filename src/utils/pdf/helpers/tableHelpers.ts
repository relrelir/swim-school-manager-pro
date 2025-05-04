import { jsPDF } from 'jspdf';
import autoTable, { UserOptions, CellHookData } from 'jspdf-autotable';
import { containsHebrew } from './contentDetection';
import { processTableCellText, forceLtrDirection, manuallyReverseString } from './textDirection';

/**
 * Process cell text based on content type for optimal table display
 */
export const processCellContent = (cell: any): { text: string, isRtl: boolean, isCurrency: boolean } => {
  if (cell === null || cell === undefined) {
    return { text: '', isRtl: false, isCurrency: false };
  }
  
  const content = String(cell);
  const isHebrewContent = containsHebrew(content);
  const isCurrency = /[₪$€£]|ILS/.test(content) || /^[\d,\.]+\s*(?:[₪$€£]|ILS)/.test(content);
  
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
    // Pure Hebrew text - needs manual character reversal to display properly in tables
    return { 
      // For Hebrew text in tables, we need to manually reverse the characters
      text: manuallyReverseString(content),
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
      
      // Log what we're doing with each cell for debugging
      console.log(`Cell "${cellContent}" processed with halign=${cell.styles.halign}`);
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
