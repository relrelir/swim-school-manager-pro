
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
    
    // ===== PARTICIPANT SECTION =====
    // Add participant details with clear section title
    addSectionTitle(pdf, 'פרטי המשתתף', lastY);
    
    // Process participant data with appropriate direction control
    const fullName = `${participant.firstname} ${participant.lastname}`;
    
    // Create participant data table - ONLY participant info (name, ID, phone)
    const participantData = [
      [fullName, 'שם מלא'],
      [forceLtrDirection(participant.idnumber || ''), 'תעודת זהות'],
      [forceLtrDirection(participant.phone || ''), 'טלפון'],
    ];
    
    console.log("Creating participant data table");
    lastY = createDataTable(pdf, participantData, lastY + 5);
    
    // ===== PARENT/GUARDIAN SECTION - SEPARATE SECTION =====
    // Parse parent info from notes field - completely separate from medical notes
    const parentInfo = parseParentInfo(healthDeclaration.notes);
    console.log("Parsed parent info:", parentInfo);
    
    // Add parent/guardian section with optimized spacing - AS SEPARATE SECTION
    addSectionTitle(pdf, 'פרטי ההורה/אפוטרופוס', lastY + 5);
    
    // Create parent info table - ensure name and ID are in separate rows
    // ONLY parent info in this section
    const parentData = [
      [parentInfo.parentName || '', 'שם מלא'],
      [forceLtrDirection(parentInfo.parentId || ''), 'תעודת זהות'],
    ];
    
    lastY = createDataTable(pdf, parentData, lastY + 10);
    
    // ===== DECLARATION SECTION =====
    // Add declaration text with more compact layout
    addSectionTitle(pdf, 'תוכן ההצהרה', lastY + 5);
    
    const declarationItems = getDeclarationItems();
    // Make declaration items more compact
    const declarationData = declarationItems.map(item => ['•', item]);
    
    console.log("Creating declaration items table");
    lastY = createPlainTextTable(pdf, declarationData, lastY + 10);
    
    // ===== MEDICAL NOTES SECTION - SEPARATE SECTION =====
    // Process medical notes separately from parent info
    const medicalNotes = parseMedicalNotes(healthDeclaration.notes);
    console.log("Parsed medical notes:", medicalNotes);
    
    addSectionTitle(pdf, 'הערות רפואיות', lastY + 5);
    
    // Display medical notes or default message in their own dedicated section
    const notesText = medicalNotes ? medicalNotes : 'אין הערות רפואיות נוספות';
    lastY = createPlainTextTable(pdf, [[notesText]], lastY + 10);
    
    // ===== CONFIRMATION SECTION =====
    // Add confirmation section with reduced spacing
    addSectionTitle(pdf, 'אישור', lastY + 5);
    lastY = createPlainTextTable(
      pdf, 
      [['אני מאשר/ת כי קראתי והבנתי את האמור לעיל ואני מצהיר/ה כי כל הפרטים שמסרתי הם נכונים.']], 
      lastY + 10
    );
    
    // ===== SIGNATURE SECTION =====
    // Add signature line with parent info
    pdf.setR2L(true); // Enable RTL for Hebrew text
    
    // Add parent details to signature line if available
    const signatureY = lastY + 15;
    if (parentInfo.parentName) {
      // Use compact format with parent name
      pdf.text(`חתימת ההורה/אפוטרופוס: ${parentInfo.parentName}`, 30, signatureY);
    } else {
      // Default signature line without details
      pdf.text('חתימת ההורה/אפוטרופוס: ________________', 30, signatureY);
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
