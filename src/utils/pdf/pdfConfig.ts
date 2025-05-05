
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import { configureHebrewFont } from './alefFontData';

// Function to set up document with proper Hebrew font support
export const createRtlPdf = async (): Promise<jsPDF> => {
  console.log("Starting PDF creation with enhanced bidirectional text support...");
  
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
    
    // CRITICAL: Set Hebrew language for better bidirectional support
    if (typeof pdf.setLanguage === 'function') {
      try {
        pdf.setLanguage('he');
        console.log("PDF language set to Hebrew");
      } catch (langError) {
        console.error("Error setting PDF language:", langError);
      }
    }
    
    // IMPORTANT: Enable RTL mode for the entire document
    // This is critical for proper text direction
    pdf.setR2L(true);
    
    console.log("PDF created successfully with Alef font and RTL mode");
    return pdf;
  } catch (error) {
    console.error("Error during Hebrew font configuration:", error);
    
    // Fallback with RTL still enabled
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
    
    // CRITICAL: Always use RTL for document styling
    pdf.setR2L(true);
    
    console.log("Document style configured successfully with font:", pdf.getFont().fontName);
  } catch (error) {
    console.error("Error configuring document style:", error);
    // Fallback to default font
    pdf.setFont('helvetica');
    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0);
    pdf.setR2L(true);
  }
}
