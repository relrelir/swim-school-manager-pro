
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import { configureHebrewFont } from './davidFontData';

// Function to set up RTL document with proper Hebrew support
export const createRtlPdf = (): jsPDF => {
  try {
    // Create PDF with standard settings
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Configure for Hebrew text support
    configureHebrewFont(pdf);
    
    console.log("RTL PDF created successfully");
    return pdf;
  } catch (error) {
    console.error("Error creating RTL PDF:", error);
    
    // Create a basic PDF as fallback
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });
    
    // Set document to RTL for Hebrew
    pdf.setR2L(true);
    pdf.setFont("helvetica");
    
    return pdf;
  }
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
  
  // Use Helvetica for better cross-platform support
  pdf.setFont("helvetica");
}
