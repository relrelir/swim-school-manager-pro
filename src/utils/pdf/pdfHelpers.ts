
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { configureDocumentStyle } from './pdfConfig';

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
  
  // Use David font
  pdf.setFont('David');
  
  return pdf;
};

/**
 * Adds a title to the PDF document
 */
export const addPdfTitle = (pdf: jsPDF, title: string): void => {
  configureDocumentStyle(pdf);
  pdf.setFontSize(20);
  pdf.text(title, pdf.internal.pageSize.width / 2, 20, { align: 'center' });
};

/**
 * Adds the current date to the PDF document
 */
export const addPdfDate = (pdf: jsPDF, date: string): void => {
  configureDocumentStyle(pdf);
  pdf.setFontSize(10);
  pdf.text(date, pdf.internal.pageSize.width - 20, 10, { align: 'right' });
};

/**
 * Adds a section title to the PDF document
 */
export const addSectionTitle = (pdf: jsPDF, title: string, y: number): void => {
  configureDocumentStyle(pdf);
  pdf.setFontSize(14);
  pdf.text(title, pdf.internal.pageSize.width - 20, y, { align: 'right' });
};

/**
 * Creates a data table in the PDF document with RTL support
 */
export const createDataTable = (
  pdf: jsPDF, 
  data: (string | number)[][], 
  startY: number, 
  hasHeader: boolean = false
): number => {
  // Configure autotable with RTL support
  const tableConfig: any = {
    startY,
    styles: { 
      font: 'David',
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
    theme: 'grid',
  };

  if (hasHeader) {
    const headers = data[0];
    const body = data.slice(1);
    
    try {
      autoTable(pdf, {
        ...tableConfig,
        head: [headers],
        body: body,
      });
    } catch (error) {
      console.error("Error creating table with header:", error);
    }
  } else {
    try {
      autoTable(pdf, {
        ...tableConfig,
        body: data,
      });
    } catch (error) {
      console.error("Error creating table without header:", error);
    }
  }

  // Return the new y position after the table
  let finalY = 0;
  try {
    finalY = (pdf as any).lastAutoTable.finalY + 5;
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
  // Configure autotable with RTL support for plain text
  try {
    autoTable(pdf, {
      startY,
      body: data,
      styles: { 
        font: 'David',
        halign: 'right',
      },
      theme: 'plain',
    });
  } catch (error) {
    console.error("Error creating plain text table:", error);
  }

  // Return the new y position after the table
  let finalY = 0;
  try {
    finalY = (pdf as any).lastAutoTable.finalY + 5;
  } catch (error) {
    console.error("Error getting finalY for plain table, using default value:", error);
    finalY = startY + 30; // Default fallback value
  }
  
  return finalY;
};
