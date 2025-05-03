
import { jsPDF } from 'jspdf';

// Function to configure jsPDF for Hebrew text support with proper fonts
export const configureHebrewFont = (pdf: jsPDF): void => {
  try {
    console.log("Configuring PDF for Hebrew text support");
    
    // Set RTL mode for Hebrew text direction
    pdf.setR2L(true);
    
    // Set properties for better Hebrew support
    pdf.setProperties({
      title: 'מסמך עברית',
      subject: 'מסמך עברית',
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
    
    console.log("Hebrew font configuration applied with RTL support");
  } catch (error) {
    console.error("Error configuring Hebrew font:", error);
    // Fallback to basic configuration
    pdf.setR2L(true);
  }
}

// Helper function to prepare HTML content with Hebrew font support
export const prepareHebrewHtmlContent = (): string => {
  return `
    @import url('https://fonts.googleapis.com/css2?family=Assistant:wght@400;700&display=swap');
    * {
      font-family: 'Assistant', Arial, sans-serif !important;
    }
  `;
}
