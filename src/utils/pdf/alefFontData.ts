
import { jsPDF } from 'jspdf';

// Function to configure jsPDF for Hebrew text support
export const configureHebrewFont = (pdf: jsPDF): void => {
  // Use standard built-in font
  pdf.setFont('helvetica');
  
  // Set RTL mode
  pdf.setR2L(true);
  
  console.log("Hebrew font configuration applied");
}
