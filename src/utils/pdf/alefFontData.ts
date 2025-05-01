
import { jsPDF } from 'jspdf';
import { addFont } from 'jspdf';

// Function to configure jsPDF for Hebrew text support
export const configureHebrewFont = (pdf: jsPDF): void => {
  try {
    console.log("Configuring PDF for Hebrew text support");
    
    // Set RTL mode for Hebrew text direction
    pdf.setR2L(true);
    
    // Use standard font that better supports Hebrew
    pdf.setFont('helvetica');
    
    // Set font size for better readability
    pdf.setFontSize(12); 
    
    // Add PDF metadata with Hebrew titles
    // Using basic Latin characters for metadata to avoid encoding issues
    pdf.setProperties({
      title: 'Health Declaration',
      subject: 'Health Declaration Form',
      creator: 'Management System'
    });
    
    // Configure line height for better spacing with Hebrew text
    // @ts-ignore - property exists but might not be in types
    if (pdf.setLineHeightFactor) {
      pdf.setLineHeightFactor(1.5);
    }
    
    // Set text color to ensure better contrast
    pdf.setTextColor(0, 0, 0);
    
    console.log("Hebrew font configuration completed with RTL support");
  } catch (error) {
    console.error("Error configuring Hebrew font:", error);
    // Fallback to basic configuration
    pdf.setR2L(true);
    pdf.setFont('helvetica');
  }
}
