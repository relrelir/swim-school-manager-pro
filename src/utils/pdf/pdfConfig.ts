
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import { configureHebrewFont } from './alefFontData';

// Function to set up RTL document with proper Hebrew support
export const createRtlPdf = async (): Promise<jsPDF> => {
  console.log("Creating RTL PDF with Hebrew support");
  
  try {
    // Create PDF with standard settings
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Configure for Hebrew text support with Alef font
    await configureHebrewFont(pdf);
    
    console.log("RTL PDF created successfully with Alef font");
    return pdf;
  } catch (error) {
    console.error("Failed to create RTL PDF:", error);
    
    // Fallback to create basic PDF without custom font
    console.log("Creating fallback PDF with basic RTL support");
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });
    
    // Basic RTL configuration
    pdf.setR2L(true);
    pdf.setFont('helvetica');
    
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
  
  // Set default font - Alef if available, otherwise helvetica
  try {
    pdf.setFont('Alef');
  } catch (e) {
    pdf.setFont('helvetica');
  }
}
