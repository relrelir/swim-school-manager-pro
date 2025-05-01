
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';

// Function to set up RTL document with Hebrew font
export const createRtlPdf = (): jsPDF => {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Add the font for Hebrew support
  pdf.addFont('Alef-Regular.ttf', 'Alef', 'normal');
  
  // Set document to RTL
  pdf.setR2L(true);
  
  // Use the Alef font for Hebrew text
  pdf.setFont('Alef');
  
  return pdf;
};

// Helper function to format document date
export const getFormattedDate = (): string => {
  return format(new Date(), 'dd/MM/yyyy');
};

// Helper to configure standard document styling
export const configureDocumentStyle = (pdf: jsPDF): void => {
  pdf.setFontSize(12);
  pdf.setTextColor(0, 0, 0);
};
