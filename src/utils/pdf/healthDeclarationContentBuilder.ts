
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
 * and optimized layout for single-page document
 */
export const buildHealthDeclarationPDF = (
  pdf: jsPDF, 
  healthDeclaration: HealthDeclarationData, 
  participant: ParticipantData
): string => {
  try {
    console.log("Starting PDF generation with enhanced bidirectional text handling");
    
    // Add title - Hebrew content with RTL
    addPdfTitle(pdf, 'הצהרת בריאות');
    
    // Add date with strongest possible LTR control
    const formattedDate = healthDeclaration.submission_date 
      ? format(new Date(healthDeclaration.submission_date), 'dd/MM/yyyy HH:mm') 
      : format(new Date(), 'dd/MM/yyyy HH:mm');
    
    addPdfDate(pdf, forceLtrDirection(formattedDate));
    
    // Use more compact spacing to fit on one page
    const startY = 40;
    let lastY = startY;
    
    // Add participant details - Hebrew section title
    addSectionTitle(pdf, 'פרטי המשתתף', lastY);
    
    // Process participant data with appropriate direction control
    const fullName = `${participant.firstname} ${participant.lastname}`;
    
    // IMPORTANT: Swap the columns - put labels in first column and data in second column
    // to match the correct RTL reading order in Hebrew
    const participantData = [
      ['שם מלא', fullName],
      ['תעודת זהות', forceLtrDirection(participant.idnumber)],
      ['טלפון', forceLtrDirection(participant.phone)],
    ];
    
    console.log("Creating participant data table");
    lastY = createDataTable(pdf, participantData, lastY + 5);
    
    // Parse and add parent/signer details - ensure proper extraction
    const parentInfo = parseParentInfo(healthDeclaration.notes);
    console.log("Parsed parent info:", parentInfo);
    
    // Add parent/guardian section with optimized spacing
    addSectionTitle(pdf, 'פרטי ההורה/אפוטרופוס', lastY + 5);
    
    // IMPORTANT: Ensure parent info is displayed correctly with labels first
    const parentData = [
      ['שם מלא', parentInfo.parentName || ''],
      ['תעודת זהות', forceLtrDirection(parentInfo.parentId || '')],
    ];
    
    lastY = createDataTable(pdf, parentData, lastY + 10);
    
    // Add declaration text with more compact layout
    addSectionTitle(pdf, 'תוכן ההצהרה', lastY + 5);
    
    const declarationItems = getDeclarationItems();
    // Make declaration items more compact
    const declarationData = declarationItems.map(item => ['•', item]);
    
    console.log("Creating declaration items table");
    lastY = createPlainTextTable(pdf, declarationData, lastY + 10);
    
    // Add medical notes - properly parsed
    const medicalNotes = parseMedicalNotes(healthDeclaration.notes);
    console.log("Parsed medical notes:", medicalNotes);
    
    addSectionTitle(pdf, 'הערות רפואיות', lastY + 5);
    // Use a smaller font size for medical notes to save space
    pdf.setFontSize(10);
    lastY = createPlainTextTable(pdf, [[medicalNotes]], lastY + 10);
    pdf.setFontSize(12); // Reset font size
    
    // Reduce spacing for confirmation to ensure everything fits on one page
    addSectionTitle(pdf, 'אישור', lastY + 3);
    lastY = createPlainTextTable(
      pdf, 
      [['אני מאשר/ת כי קראתי והבנתי את האמור לעיל ואני מצהיר/ה כי כל הפרטים שמסרתי הם נכונים.']], 
      lastY + 6
    );
    
    // Add signature line with parent info
    pdf.setR2L(true); // Enable RTL for Hebrew text
    
    // Add parent details to signature line if available in more compact form
    if (parentInfo.parentName && parentInfo.parentId) {
      pdf.text(`חתימת ההורה/אפוטרופוס: ${parentInfo.parentName}, ת.ז.: ${parentInfo.parentId}`, 30, lastY + 12);
    } else {
      pdf.text('חתימת ההורה/אפוטרופוס: ________________', 30, lastY + 12);
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
