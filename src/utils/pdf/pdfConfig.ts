
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import { configureHebrewFont } from './alefFontData';

// Function to set up RTL document with proper Hebrew support
export const createRtlPdf = (): jsPDF => {
  // Create PDF with standard settings
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Configure for Hebrew text support with Alef font
  configureHebrewFont(pdf);
  
  console.log("RTL PDF created successfully with Alef font");
  return pdf;
};

// Helper function to format document date
export const getFormattedDate = (): string => {
  return format(new Date(), 'dd/MM/yyyy');
};

// Helper to configure standard document styling
export const configureDocumentStyle = (pdf: jsPDF): void => {
  // Use Alef font as default
  pdf.setFont('Alef');
  
  // Standard settings
  pdf.setFontSize(12);
  pdf.setTextColor(0, 0, 0);
}
