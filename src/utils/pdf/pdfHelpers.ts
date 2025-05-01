
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Extend the jsPDF type to include the lastAutoTable property added by autotable plugin
declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable: {
      finalY: number;
    };
  }
}

/**
 * Creates and configures a new PDF document
 */
export const createPdf = (): jsPDF => {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });
  
  // Enable RTL support for Hebrew
  pdf.setR2L(true);
  
  return pdf;
};

/**
 * Adds a title to the PDF
 */
export const addPdfTitle = (pdf: jsPDF, title: string): void => {
  pdf.setFontSize(20);
  pdf.text(title, pdf.internal.pageSize.width / 2, 20, { align: 'center' });
};

/**
 * Adds a date to the PDF
 */
export const addPdfDate = (pdf: jsPDF, dateString: string): void => {
  pdf.setFontSize(12);
  pdf.text(`תאריך: ${dateString}`, pdf.internal.pageSize.width - 20, 30, { align: 'right' });
};

/**
 * Adds a section title to the PDF
 */
export const addSectionTitle = (pdf: jsPDF, title: string, yPosition: number): void => {
  pdf.setFontSize(14);
  pdf.text(title, 20, yPosition);
};

/**
 * Creates a table in the PDF
 */
export const createDataTable = (
  pdf: jsPDF, 
  data: string[][], 
  startY: number, 
  hasHeader: boolean = false
): number => {
  autoTable(pdf, {
    startY,
    head: hasHeader ? [['Key', 'Value']] : [],
    body: data,
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 10,
      halign: 'right',
    },
    headStyles: {
      fillColor: [220, 220, 220],
    }
  });
  
  return pdf.lastAutoTable.finalY;
};

/**
 * Creates a plain text table in the PDF (without grid)
 */
export const createPlainTextTable = (
  pdf: jsPDF,
  data: string[][],
  startY: number,
  columnWidths?: { [key: number]: { cellWidth: number | 'auto' } }
): number => {
  autoTable(pdf, {
    startY,
    head: [],
    body: data,
    theme: 'plain',
    styles: {
      font: 'helvetica',
      fontSize: 10,
      halign: 'right',
    },
    columnStyles: columnWidths || {}
  });
  
  return pdf.lastAutoTable.finalY;
};
