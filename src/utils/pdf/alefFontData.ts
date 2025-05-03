
import { jsPDF } from 'jspdf';

// Function to configure jsPDF for Hebrew text support with Alef font
export const configureHebrewFont = async (pdf: jsPDF): Promise<void> => {
  try {
    console.log("Configuring PDF for Hebrew text support with Alef font");
    
    // Load the font definition files dynamically
    // This prevents Vite from trying to statically analyze these files
    await Promise.all([
      import('../../assets/fonts/Alef-Regular-normal.js'),
      import('../../assets/fonts/Alef-Bold-bold.js')
    ]);
    
    // Set RTL mode for Hebrew text direction
    pdf.setR2L(true);
    
    // Use Alef font that properly supports Hebrew characters
    pdf.setFont('Alef');
    
    // Add PDF metadata with Hebrew titles
    pdf.setProperties({
      title: 'הצהרת בריאות',
      subject: 'הצהרת בריאות',
      creator: 'מערכת ניהול'
    });
    
    // Set font size for better readability with Hebrew text
    pdf.setFontSize(14);
    
    // Set line height for better spacing with Hebrew text
    // @ts-ignore - property exists but might not be in types
    if (pdf.setLineHeightFactor) {
      pdf.setLineHeightFactor(1.5);
    }
    
    // Set text color to ensure better contrast
    pdf.setTextColor(0, 0, 0);
    
    console.log("Hebrew font configuration applied with Alef font and RTL support");
  } catch (error) {
    console.error("Error configuring Alef font:", error);
    // Fallback to basic configuration with standard font
    pdf.setR2L(true);
    pdf.setFont('helvetica');
    console.warn("Falling back to helvetica font due to error");
  }
}
