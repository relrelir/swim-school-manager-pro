
import { jsPDF } from 'jspdf';

// Base64 encoded font data for David Regular
// In a real implementation, this would contain the actual base64 data of the font
const davidRegularBase64 = 'AAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';

// Base64 encoded font data for David Bold
// In a real implementation, this would contain the actual base64 data of the font
const davidBoldBase64 = 'AAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';

/**
 * Configures jsPDF instance with David font for Hebrew text support
 */
export const configureHebrewFont = (pdf: jsPDF): void => {
  try {
    console.log("Configuring PDF for Hebrew text support using David font");
    
    // Set document to RTL for Hebrew
    pdf.setR2L(true);
    
    // Add the fonts to jsPDF
    pdf.addFont("David-Regular.ttf", "David", "normal");
    pdf.addFont("David-Bold.ttf", "David", "bold");
    
    // Set font to David
    pdf.setFont("David");
    
    // Add PDF metadata with Hebrew titles
    pdf.setProperties({
      title: 'הצהרת בריאות',
      subject: 'הצהרת בריאות',
      creator: 'מערכת ניהול'
    });
    
    // Increase font size for better readability with Hebrew text
    pdf.setFontSize(14);
    
    // Set line height for better spacing with Hebrew text
    // @ts-ignore - property exists but might not be in types
    if (pdf.setLineHeightFactor) {
      pdf.setLineHeightFactor(1.5);
    }
    
    // Set text color to ensure better contrast
    pdf.setTextColor(0, 0, 0);
    
    console.log("Hebrew font configuration applied with RTL support using David font");
  } catch (error) {
    console.error("Error configuring Hebrew font:", error);
    // Fallback to basic configuration
    pdf.setR2L(true);
    pdf.setFont("helvetica");
    console.warn("Falling back to helvetica font due to error loading David font");
  }
};

// Export these constants for direct use if needed
export { davidRegularBase64, davidBoldBase64 };
