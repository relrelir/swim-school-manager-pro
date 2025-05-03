
import { jsPDF } from 'jspdf';
import { configureHebrewFont } from '../hebrewPdfConfig';

/**
 * Generate PDF from image data URL
 */
export const generatePdfFromImage = (
  dataUrl: string,
  participantName: string,
  declarationId: string
): string => {
  console.log("Creating PDF from image");
  
  // Create a PDF with standard settings
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });
  
  // Configure Hebrew font
  configureHebrewFont(pdf);
  
  // Add the image to the PDF
  const imgWidth = pdf.internal.pageSize.getWidth();
  const imgHeight = (1200 * imgWidth) / 800; // Maintain aspect ratio
  
  console.log("Adding image to PDF with dimensions:", { imgWidth, imgHeight });
  pdf.addImage(dataUrl, 'PNG', 0, 0, imgWidth, imgHeight);
  
  // Generate filename
  const fileName = `health_declaration_${participantName.replace(/\s+/g, '_')}_${declarationId.substring(0, 8)}.pdf`;
  
  // Save the PDF
  pdf.save(fileName);
  console.log("PDF saved successfully with filename:", fileName);
  
  return fileName;
};
