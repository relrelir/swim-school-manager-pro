
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import { configureHebrewFont } from './davidFontData';
import davidRegular from '@/assets/fonts/David-Regular.ttf';
import davidBold from '@/assets/fonts/David-Bold.ttf';

// Register the David fonts with jsPDF
const registerDavidFonts = (pdf: jsPDF): void => {
  try {
    console.log("Registering David fonts");
    // Add fonts to the PDF document
    pdf.addFileToVFS('David-Regular.ttf', davidRegular);
    pdf.addFileToVFS('David-Bold.ttf', davidBold);
    
    // Register the fonts
    pdf.addFont('David-Regular.ttf', 'David', 'normal');
    pdf.addFont('David-Bold.ttf', 'David', 'bold');
    
    console.log("David fonts registered successfully");
  } catch (error) {
    console.error("Error registering David fonts:", error);
  }
};

// Function to set up RTL document with proper Hebrew support
export const createRtlPdf = (): jsPDF => {
  // Create PDF with standard settings
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });
  
  // Register David fonts
  registerDavidFonts(pdf);

  // Configure for Hebrew text support
  configureHebrewFont(pdf);
  
  console.log("RTL PDF created successfully with David font");
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
  
  // Set David font as default
  pdf.setFont('David');
}
