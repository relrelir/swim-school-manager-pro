
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
  
  // Use standard font
  pdf.setFont('helvetica');
  
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
  try {
    // Configure autotable with RTL support
    const tableConfig: any = {
      startY,
      theme: 'grid',
      styles: {
        font: 'helvetica',
        fontSize: 10,
        halign: 'right',
        cellPadding: 5,
        lineColor: [100, 100, 100],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [230, 230, 230],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
      },
      columnStyles: {
        0: { fontStyle: 'bold', fillColor: [240, 240, 240] }
      },
      margin: { right: 20 }
    };

    if (hasHeader) {
      const headers = data[0];
      const body = data.slice(1);
      
      autoTable(pdf, {
        ...tableConfig,
        head: [headers],
        body: body,
      });
    } else {
      autoTable(pdf, {
        ...tableConfig,
        body: data,
      });
    }
    
    // Return the new y position after the table
    return (pdf as any).lastAutoTable.finalY + 5;
  } catch (error) {
    console.error("Error creating data table:", error);
    return startY + 50; // Default fallback position
  }
};

/**
 * Creates a plain text table (without grid lines) with RTL support
 */
export const createPlainTextTable = (
  pdf: jsPDF, 
  data: (string | number)[][], 
  startY: number
): number => {
  try {
    autoTable(pdf, {
      startY,
      body: data,
      styles: { 
        font: 'helvetica',
        fontSize: 10,
        halign: 'right',
        cellPadding: 3,
      },
      theme: 'plain',
      margin: { right: 20 },
    });
    
    // Return the new y position after the table
    return (pdf as any).lastAutoTable.finalY + 5;
  } catch (error) {
    console.error("Error creating plain text table:", error);
    return startY + 30; // Default fallback position
  }
};
