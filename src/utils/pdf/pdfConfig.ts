
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import { configureHebrewFont } from './alefFontData';

// Function to set up document with proper Hebrew font support
export const createRtlPdf = async (): Promise<jsPDF> => {
  // Create PDF with standard settings
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  try {
    // Configure for Hebrew text support with Alef font
    await configureHebrewFont(pdf);
    
    // CRITICAL: Set Hebrew language for better bidirectional support
    if (typeof pdf.setLanguage === 'function') {
      try {
        pdf.setLanguage('he');
      } catch (langError) {
        // Language setting failed, continue without it
      }
    }
    
    // IMPORTANT: Enable RTL mode for the entire document
    // This is critical for proper text direction
    pdf.setR2L(true);
    
    return pdf;
  } catch (error) {
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
  } catch (error) {
    // Fallback to default font
    pdf.setFont('helvetica');
    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0);
    pdf.setR2L(true);
  }
}
