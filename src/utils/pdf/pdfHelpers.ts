
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import 'src/assets/fonts/Roboto-Regular-normal';
import 'src/assets/fonts/Roboto-Bold-bold';

// Extend the jsPDF type to include the lastAutoTable property added by autotable plugin
declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable: {
      finalY: number;
    };
  }
}

/**
 * Creates and configures a new PDF document with Hebrew support
 */
export const createPdf = (): jsPDF => {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });
  
  // Add Hebrew font support
  pdf.addFont('src/assets/fonts/David-Regular.ttf', 'David', 'normal');
  pdf.addFont('src/assets/fonts/David-Bold.ttf', 'David', 'bold');
  
  // Set default font to David for Hebrew support
  pdf.setFont('David');
  
  // Enable RTL support for Hebrew
  pdf.setR2L(true);
  
  return pdf;
};

/**
 * Adds a title to the PDF
 */
export const addPdfTitle = (pdf: jsPDF, title: string): void => {
  pdf.setFontSize(20);
  pdf.setFont('David', 'bold');
  pdf.text(title, pdf.internal.pageSize.width / 2, 20, { align: 'center' });
  pdf.setFont('David', 'normal');
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
  pdf.setFont('David', 'bold');
  pdf.text(title, 20, yPosition);
  pdf.setFont('David', 'normal');
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
      font: 'David',
      fontSize: 10,
      halign: 'right',
      direction: 'rtl',
    },
    headStyles: {
      fillColor: [220, 220, 220],
      font: 'David',
      fontStyle: 'bold',
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
      font: 'David',
      fontSize: 10,
      halign: 'right',
      direction: 'rtl',
    },
    columnStyles: columnWidths || {}
  });
  
  return pdf.lastAutoTable.finalY;
};
