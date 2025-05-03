
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import { configureHebrewFont } from './alefFontData';

// Function to set up RTL document with proper Hebrew support
export const createRtlPdf = async (): Promise<jsPDF> => {
  console.log("Starting RTL PDF creation...");
  
  // Create PDF with standard settings
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  try {
    console.log("Configuring Hebrew font support...");
    // Configure for Hebrew text support with Alef font
    await configureHebrewFont(pdf);
    
    console.log("RTL PDF created successfully with Alef font");
    return pdf;
  } catch (error) {
    console.error("Error during Hebrew font configuration:", error);
    
    // Attempt minimal RTL support with fallback font
    console.log("Setting up fallback RTL support...");
    pdf.setR2L(true);
    
    // Verify the PDF object is still valid
    if (!pdf || typeof pdf.text !== 'function') {
      throw new Error("PDF object is invalid after font configuration error");
    }
    
    return pdf;
  }
};

// Helper function to format document date
export const getFormattedDate = (): string => {
  return format(new Date(), 'dd/MM/yyyy');
};

// Helper to configure standard document styling
export const configureDocumentStyle = (pdf: jsPDF): void => {
  try {
    // Use Alef font as default
    pdf.setFont('Alef');
    
    // Standard settings
    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0);
    
    console.log("Document style configured successfully with font:", pdf.getFont().fontName);
  } catch (error) {
    console.error("Error configuring document style:", error);
    // Fallback to default font
    pdf.setFont('helvetica');
    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0);
  }
}
