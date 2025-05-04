
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import { 
  addPdfTitle, 
  addPdfDate, 
  addSectionTitle, 
  createDataTable,
  createPlainTextTable
} from './pdfHelpers';
import { parseParentInfo, parseMedicalNotes, getDeclarationItems } from './healthDeclarationParser';
import { forceLtrDirection } from './helpers/textDirection';

interface ParticipantData {
  firstname: string;
  lastname: string;
  idnumber: string;
  phone: string;
}

interface HealthDeclarationData {
  id: string;
  participant_id: string;
  submission_date: string | null;
  notes: string | null;
  form_status: string;
}

/**
 * Builds the content of a health declaration PDF with enhanced bidirectional text support
 * and ensures the document fits on a single page
 */
export const buildHealthDeclarationPDF = (
  pdf: jsPDF, 
  healthDeclaration: HealthDeclarationData, 
  participant: ParticipantData
): string => {
  try {
    console.log("Starting PDF generation with enhanced bidirectional text handling");
    
    // Adjust font sizes and spacing to fit on one page
    const titleFontSize = 18;
    const sectionFontSize = 12;
    const contentFontSize = 10;
    const spacing = 10;
    
    // Configure PDF for compact layout
    pdf.setFontSize(contentFontSize);
    
    // Add title - Hebrew content with RTL
    addPdfTitle(pdf, 'הצהרת בריאות', titleFontSize);
    
    // Add date with strongest possible LTR control
    const formattedDate = healthDeclaration.submission_date 
      ? format(new Date(healthDeclaration.submission_date), 'dd/MM/yyyy HH:mm') 
      : format(new Date(), 'dd/MM/yyyy HH:mm');
    
    addPdfDate(pdf, forceLtrDirection(formattedDate));
    
    // Add participant details - Hebrew section title
    addSectionTitle(pdf, 'פרטי המשתתף', 40, sectionFontSize);
    
    // Process participant data with appropriate direction control
    const fullName = `${participant.firstname} ${participant.lastname}`;
    
    // IMPORTANT: Swap the columns - put data in first column and labels in second column
    const participantData = [
      [fullName, 'שם מלא'],
      [forceLtrDirection(participant.idnumber), 'תעודת זהות'],
      [forceLtrDirection(participant.phone), 'טלפון'],
    ];
    
    console.log("Creating participant data table");
    let lastY = createDataTable(pdf, participantData, 45);
    
    // Parse parent information
    const parentInfo = parseParentInfo(healthDeclaration.notes);
    console.log("Parent info parsed:", parentInfo);
    
    // Add parent/signer details section
    addSectionTitle(pdf, 'פרטי ההורה/אפוטרופוס', lastY + spacing, sectionFontSize);
    
    // Create parent info table with correct column order for RTL display
    const parentData = [
      [parentInfo.parentName || '', 'שם מלא'],
      [forceLtrDirection(parentInfo.parentId) || '', 'תעודת זהות'],
    ];
    
    lastY = createDataTable(pdf, parentData, lastY + spacing + 5);
    
    // Add declaration items with smaller spacing
    addSectionTitle(pdf, 'תוכן ההצהרה', lastY + spacing, sectionFontSize);
    
    const declarationItems = getDeclarationItems();
    const declarationData = declarationItems.map(item => [
      '•', 
      item
    ]);
    
    console.log("Creating declaration items table");
    lastY = createPlainTextTable(pdf, declarationData, lastY + spacing + 5);
    
    // Add medical notes - always show this section
    const medicalNotes = parseMedicalNotes(healthDeclaration.notes);
    console.log("Medical notes parsed:", medicalNotes);
    
    addSectionTitle(pdf, 'הערות רפואיות', lastY + spacing, sectionFontSize);
    
    // Display the medical notes or default message
    const notesText = medicalNotes.trim() || 'אין הערות רפואיות נוספות';
    lastY = createPlainTextTable(pdf, [[notesText]], lastY + spacing + 5);
    
    // Add confirmation with reduced spacing
    addSectionTitle(pdf, 'אישור', lastY + spacing, sectionFontSize);
    
    lastY = createPlainTextTable(pdf, [['אני מאשר/ת כי קראתי והבנתי את האמור לעיל ואני מצהיר/ה כי כל הפרטים שמסרתי הם נכונים.']], lastY + spacing + 3);
    
    // Add signature line with parent info
    pdf.setR2L(true); // Enable RTL for Hebrew text
    pdf.setFontSize(contentFontSize);
    
    // Add parent details to signature line if available
    if (parentInfo.parentName) {
      pdf.text(`חתימת ההורה/אפוטרופוס: ${parentInfo.parentName}`, 30, lastY + spacing + 5);
      
      if (parentInfo.parentId) {
        pdf.text(`ת.ז.: ${parentInfo.parentId}`, 30, lastY + spacing + 10);
      }
    } else {
      // Default signature line without details
      pdf.text('חתימת ההורה/אפוטרופוס: ________________', 30, lastY + spacing + 7);
    }
    
    pdf.setR2L(false); // Reset RTL setting
    
    // Generate filename
    const fileName = `הצהרת_בריאות_${participant.firstname}_${participant.lastname}.pdf`;
    
    console.log("PDF generation completed successfully");
    return fileName;
  } catch (error) {
    console.error('Error building PDF content:', error);
    throw error;
  }
};
