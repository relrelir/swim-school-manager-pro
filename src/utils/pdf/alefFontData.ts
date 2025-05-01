
import { jsPDF } from 'jspdf';

// Function to add the Alef font to jsPDF
export const addAlefFont = (pdf: jsPDF): void => {
  // Use standard fonts until Alef is properly loaded
  pdf.setFont('helvetica');
  
  // Add the font with fallback mechanism
  try {
    // Use standard PDF font instead of trying to load a custom font
    pdf.addFont('helvetica-bold', 'Alef-Bold', 'bold');
    pdf.addFont('helvetica', 'Alef', 'normal');
    console.log("Font added successfully");
  } catch (error) {
    console.error("Error adding font:", error);
    // Ensure we have a working font
    pdf.setFont('helvetica');
  }
}
