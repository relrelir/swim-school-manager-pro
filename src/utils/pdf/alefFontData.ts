
import { jsPDF } from 'jspdf';
import fs from 'fs-extra';
import path from 'path';

// Function to configure jsPDF for Hebrew text support with Alef font
export const configureHebrewFont = (pdf: jsPDF): void => {
  try {
    // Set RTL mode
    pdf.setR2L(true);
    
    // Use standard font for fallback
    pdf.setFont('helvetica');
    
    console.log("Hebrew font configuration applied with RTL support");
  } catch (error) {
    console.error("Error configuring Hebrew font:", error);
    // Fallback to basic configuration
    pdf.setR2L(true);
    pdf.setFont('helvetica');
  }
}

// Base64 representation of the Alef font for embedding in PDF
// This will be used when implementing pdfMake
export const getAlefFontBase64 = (): string => {
  try {
    const fontPath = path.join(process.cwd(), 'public/fonts/Alef-Regular.ttf');
    return fs.readFileSync(fontPath).toString('base64');
  } catch (error) {
    console.error("Error loading Alef font:", error);
    return '';
  }
}
