import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import { configureHebrewFont } from './alefFontData';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import fs from 'fs-extra';
import path from 'path';

// Initialize pdfMake with Alef font
try {
  // Try to read the Alef font file directly from the public directory
  const fontPath = path.join(process.cwd(), 'public/fonts/Alef-Regular.ttf');
  const alefFont = fs.readFileSync(fontPath).toString('base64');
  
  // Configure pdfMake with Alef font
  pdfMake.vfs = { 
    ...pdfFonts.pdfMake.vfs, 
    'Alef-Regular.ttf': alefFont 
  };
  
  pdfMake.fonts = { 
    Alef: {
      normal: 'Alef-Regular.ttf',
      bold: 'Alef-Regular.ttf'
    },
    // Keep default fonts as fallback
    Roboto: {
      normal: 'Roboto-Regular.ttf',
      bold: 'Roboto-Medium.ttf'
    },
    Helvetica: {
      normal: 'Helvetica',
      bold: 'Helvetica-Bold'
    }
  };
  
  console.log("pdfMake configured with Alef font");
} catch (error) {
  console.error("Error configuring pdfMake with Alef font:", error);
}

// Function to set up RTL document with proper Hebrew support
export const createRtlPdf = (): jsPDF => {
  // Create PDF with standard settings
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Configure for Hebrew text support
  configureHebrewFont(pdf);
  
  console.log("RTL PDF created successfully");
  return pdf;
};

// Helper function to format document date
export const getFormattedDate = (): string => {
  return format(new Date(), 'dd/MM/yyyy');
};

// Helper to configure standard document styling
export const configureDocumentStyle = (pdf: jsPDF): void => {
  // Use standard settings
  pdf.setFontSize(12);
  pdf.setTextColor(0, 0, 0);
  
  // Try to set Alef font, fallback to helvetica
  try {
    pdf.setFont('helvetica');
  } catch (error) {
    console.error("Error setting font, falling back to default:", error);
    pdf.setFont('helvetica');
  }
}
