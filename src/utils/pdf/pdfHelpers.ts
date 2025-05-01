
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
  
  // Use the Alef font for Hebrew text
  pdf.setFont('Alef');
  
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
 * Creates a data table in the PDF document
 */
export const createDataTable = (
  pdf: jsPDF, 
  data: (string | number)[][], 
  startY: number, 
  hasHeader: boolean = false
): number => {
  // Configure autotable with RTL support
  const tableConfig = {
    startY,
    styles: { 
      font: 'Alef',
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
    
    // @ts-ignore - the types for autoTable are not complete
    autoTable(pdf, {
      ...tableConfig,
      head: [headers],
      body: body,
    });
  } else {
    // @ts-ignore - the types for autoTable are not complete
    autoTable(pdf, {
      ...tableConfig,
      body: data,
    });
  }

  // Return the new y position after the table
  return (pdf as any).lastAutoTable.finalY + 5;
};

/**
 * Creates a plain text table (without grid lines)
 */
export const createPlainTextTable = (
  pdf: jsPDF, 
  data: (string | number)[][], 
  startY: number
): number => {
  // Configure autotable with RTL support for plain text
  // @ts-ignore - the types for autoTable are not complete
  autoTable(pdf, {
    startY,
    body: data,
    styles: { 
      font: 'Alef',
      halign: 'right',
    },
    theme: 'plain',
  });

  // Return the new y position after the table
  return (pdf as any).lastAutoTable.finalY + 5;
};
