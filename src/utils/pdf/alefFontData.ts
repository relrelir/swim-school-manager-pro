
import { jsPDF } from 'jspdf';
import davidRegularFontBase64 from './davidFontData';

// Function to configure jsPDF for Hebrew text support using David font
export const configureHebrewFont = (pdf: jsPDF): void => {
  try {
    console.log("Configuring PDF for Hebrew text support with David font");
    
    // Add David font to the PDF document
    pdf.addFileToVFS('David-Regular.ttf', davidRegularFontBase64);
    pdf.addFont('David-Regular.ttf', 'David', 'normal');
    
    // Set RTL mode for Hebrew text direction
    pdf.setR2L(true);
    
    // Use David font for Hebrew characters
    pdf.setFont('David');
    
    // Add PDF metadata with Hebrew titles
    pdf.setProperties({
      title: 'הצהרת בריאות',
      subject: 'הצהרת בריאות',
      creator: 'מערכת ניהול'
    });
    
    // Increase font size slightly for better readability with Hebrew text
    pdf.setFontSize(14);
    
    // Set line height for better spacing with Hebrew text
    // @ts-ignore - property exists but might not be in types
    if (pdf.setLineHeightFactor) {
      pdf.setLineHeightFactor(1.5);
    }
    
    // Set text color to ensure better contrast
    pdf.setTextColor(0, 0, 0);
    
    console.log("David font configuration applied with RTL support");
  } catch (error) {
    console.error("Error configuring Hebrew font:", error);
    // Fallback to basic configuration
    pdf.setR2L(true);
    pdf.setFont('helvetica');
  }
}

