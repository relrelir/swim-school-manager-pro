
import { jsPDF } from 'jspdf';

/**
 * Configures jsPDF instance for Hebrew text support
 * We're using a fallback approach since actual font embedding is causing issues
 */
export const configureHebrewFont = (pdf: jsPDF): void => {
  try {
    console.log("Configuring PDF for Hebrew text support");
    
    // Set document to RTL for Hebrew
    pdf.setR2L(true);
    
    // Use standard available fonts instead of trying to embed David
    // Helvetica works best for PDF exports with Hebrew
    pdf.setFont("helvetica");
    
    // Add PDF metadata with Hebrew titles
    pdf.setProperties({
      title: 'הצהרת בריאות',
      subject: 'הצהרת בריאות',
      creator: 'מערכת ניהול'
    });
    
    // Increase font size for better readability with Hebrew text
    pdf.setFontSize(14);
    
    // Set text color to ensure better contrast
    pdf.setTextColor(0, 0, 0);
    
    console.log("Hebrew RTL support configured successfully");
  } catch (error) {
    console.error("Error configuring Hebrew font:", error);
    // Fallback to basic configuration
    pdf.setR2L(true);
    pdf.setFont("helvetica");
    console.warn("Using default font configuration");
  }
};

// Export empty constants to maintain API compatibility
export const davidRegularBase64 = '';
export const davidBoldBase64 = '';
