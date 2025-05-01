
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import { addAlefFont } from './alefFontData';

// Function to set up RTL document with Hebrew font
export const createRtlPdf = (): jsPDF => {
  // Create PDF with standard settings
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Set document to RTL
  pdf.setR2L(true);
  
  // Add the font with fallback
  addAlefFont(pdf);
  
  return pdf;
};

// Helper function to format document date
export const getFormattedDate = (): string => {
  return format(new Date(), 'dd/MM/yyyy');
};

// Helper to configure standard document styling
export const configureDocumentStyle = (pdf: jsPDF): void => {
  // Use standard settings
  pdf.setFontSize(12);
  pdf.setTextColor(0, 0, 0);
  pdf.setFont('helvetica');
}
