
import { jsPDF } from 'jspdf';
import { configureDocumentStyle } from '../pdfConfig';

/**
 * Creates a new PDF document with RTL support for Hebrew
 */
export const createPdf = (): jsPDF => {
  // Use the RTL PDF creation from our pdfConfig
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });
  
  // Default to non-RTL initially - we'll handle RTL explicitly for each text element
  pdf.setR2L(false);
  
  try {
    // Use Alef font
    pdf.setFont('Alef');
  } catch (error) {
    // Fallback to standard font
    pdf.setFont('helvetica');
  }
  
  return pdf;
};
