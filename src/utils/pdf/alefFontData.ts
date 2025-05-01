
import { jsPDF } from 'jspdf';

// Function to configure jsPDF for Hebrew text support with standard fonts
export const configureHebrewFont = (pdf: jsPDF): void => {
  try {
    // Set RTL mode
    pdf.setR2L(true);
    
    // Use standard font
    pdf.setFont('helvetica');
    
    console.log("Hebrew font configuration applied with RTL support");
  } catch (error) {
    console.error("Error configuring Hebrew font:", error);
    // Fallback to basic configuration
    pdf.setR2L(true);
    pdf.setFont('helvetica');
  }
}
