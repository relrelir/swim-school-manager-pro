
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

  // Configure for Hebrew text support using David font
  configureHebrewFont(pdf);
  
  console.log("RTL PDF created successfully with David font");
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
  
  // Set default font to David
  pdf.setFont('David');
}
