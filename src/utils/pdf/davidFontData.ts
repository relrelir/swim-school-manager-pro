
import { jsPDF } from 'jspdf';

// Base64 encoded David font data (placeholder)
// In a real implementation, this would be the full base64 string
const davidRegularBase64 = 'data:font/ttf;base64,AAEAAAASAQAABAAAR...'; // Shortened for demonstration
const davidBoldBase64 = 'data:font/ttf;base64,AAEAAAASAQAABAAAR...'; // Shortened for demonstration

// Function to configure jsPDF to use David font for Hebrew text
export const configureDavidFont = (pdf: jsPDF): void => {
  try {
    console.log("Configuring PDF with David font for Hebrew text");
    
    // Add the David font to the PDF
    pdf.addFileToVFS('David-Regular.ttf', davidRegularBase64);
    pdf.addFont('David-Regular.ttf', 'David', 'normal');
    
    pdf.addFileToVFS('David-Bold.ttf', davidBoldBase64);
    pdf.addFont('David-Bold.ttf', 'David', 'bold');
    
    // Set the font
    pdf.setFont('David');
    
    // Set RTL mode for Hebrew text direction
    pdf.setR2L(true);
    
    // Add PDF metadata with Hebrew titles
    pdf.setProperties({
      title: 'מסמך עברית',
      subject: 'מסמך עברית',
      creator: 'מערכת ניהול'
    });
    
    console.log("David font configured successfully");
  } catch (error) {
    console.error("Error configuring David font:", error);
    // Fallback to basic configuration with standard font
    try {
      pdf.setR2L(true);
      pdf.setFont('helvetica');
      console.log("Fallback to helvetica font applied");
    } catch (innerError) {
      console.error("Error applying fallback font:", innerError);
    }
  }
}
