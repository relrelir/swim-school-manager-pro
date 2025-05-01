
import { jsPDF } from 'jspdf';

// Function to configure jsPDF for Hebrew text support with standard fonts
export const configureHebrewFont = (pdf: jsPDF): void => {
  try {
    console.log("Configuring PDF for Hebrew text support");
    
    // Set RTL mode for Hebrew text direction
    pdf.setR2L(true);
    
    // Use standard font that supports Hebrew characters better
    pdf.setFont('helvetica');
    
    // Add PDF metadata with Hebrew titles
    pdf.setProperties({
      title: 'הצהרת בריאות',
      subject: 'הצהרת בריאות',
      creator: 'מערכת ניהול'
    });
    
    // Increase font size slightly for better readability
    pdf.setFontSize(12);
    
    // Set line height for better spacing with Hebrew text
    // @ts-ignore - property exists but might not be in types
    if (pdf.setLineHeightFactor) {
      pdf.setLineHeightFactor(1.25);
    }
    
    console.log("Hebrew font configuration applied with RTL support");
  } catch (error) {
    console.error("Error configuring Hebrew font:", error);
    // Fallback to basic configuration
    pdf.setR2L(true);
    pdf.setFont('helvetica');
  }
}
