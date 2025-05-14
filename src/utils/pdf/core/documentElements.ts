
import { jsPDF } from 'jspdf';
import { configureDocumentStyle } from '../pdfConfig';
import { logoBase64 } from '../logoData';

/**
 * Adds a logo to the PDF document
 */
export const addPdfLogo = (pdf: jsPDF, x: number = 20, y: number = 15, width: number = 20): void => {
  try {
    pdf.addImage(logoBase64, 'PNG', pdf.internal.pageSize.width - x - width, y, width, width);
  } catch (error) {
    console.error('Error adding logo to PDF:', error);
    // Continue without logo if there's an error
  }
};

/**
 * Adds a title to the PDF document
 */
export const addPdfTitle = (pdf: jsPDF, title: string): void => {
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
  configureDocumentStyle(pdf);
  pdf.setFontSize(10);
  
  // Date is always LTR (numbers)
  pdf.setR2L(false);
  // Use explicit LTR for date with strong controls
  pdf.text(date, pdf.internal.pageSize.width - 20, 10, { align: 'right' });
};

/**
 * Adds a section title to the PDF document
 */
export const addSectionTitle = (pdf: jsPDF, title: string, y: number): void => {
  configureDocumentStyle(pdf);
  pdf.setFontSize(14);
  
  // Hebrew section title should be RTL
  pdf.setR2L(true);
  pdf.text(title, pdf.internal.pageSize.width - 20, y, { align: 'right' });
  pdf.setR2L(false); // Reset for subsequent operations
};
