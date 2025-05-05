
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
 * CRITICAL FIX: Optimized to properly display Hebrew text without reversing
 */
export const buildHealthDeclarationPDF = (
  pdf: jsPDF, 
  healthDeclaration: HealthDeclarationData, 
  participant: ParticipantData
): string => {
  try {
    console.log("Starting PDF generation with enhanced bidirectional text handling");
    console.log("Raw notes field:", healthDeclaration.notes);
    
    // CRITICAL FIX: Add title with direct Hebrew support - no need for text manipulation
    pdf.setR2L(true); // Enable RTL for Hebrew titles
    addPdfTitle(pdf, 'הצהרת בריאות');
    pdf.setR2L(false);
    
    // Add date with strongest possible LTR control
    const formattedDate = healthDeclaration.submission_date 
      ? format(new Date(healthDeclaration.submission_date), 'dd/MM/yyyy HH:mm') 
      : format(new Date(), 'dd/MM/yyyy HH:mm');
    
    addPdfDate(pdf, forceLtrDirection(formattedDate));
    
    // Use more compact spacing to fit on one page
    const startY = 40;
    let lastY = startY;
    
    // ===== PARTICIPANT SECTION =====
    pdf.setR2L(true); // Enable RTL for section titles
    addSectionTitle(pdf, 'פרטי המשתתף', lastY);
    pdf.setR2L(false);
    
    // Process participant data
    const fullName = `${participant.firstname} ${participant.lastname}`;
    
    // CRITICAL FIX: Create participant data table with improved formatting
    const participantData = [
      [fullName, 'שם מלא'],
      [forceLtrDirection(participant.idnumber || ''), 'תעודת זהות'],
      [forceLtrDirection(participant.phone || ''), 'טלפון'],
    ];
    
    console.log("Creating participant data table");
    lastY = createDataTable(pdf, participantData, lastY + 5);
    
    // ===== PARENT/GUARDIAN SECTION - SEPARATE SECTION =====
    // CRITICAL FIX: Parse parent info with our improved parser
    const parentInfo = parseParentInfo(healthDeclaration.notes);
    console.log("Parsed parent info:", parentInfo);
    
    // Add parent/guardian section with optimized spacing
    pdf.setR2L(true);
    addSectionTitle(pdf, 'פרטי ההורה/אפוטרופוס', lastY + 5);
    pdf.setR2L(false);
    
    // CRITICAL FIX: Create parent info table - using the correctly parsed parent name
    const parentData = [
      [parentInfo.parentName || 'לא צוין', 'שם מלא'],
      [forceLtrDirection(parentInfo.parentId || 'לא צוין'), 'תעודת זהות'],
    ];
    
    console.log("Parent name being used:", parentInfo.parentName || 'לא צוין');
    lastY = createDataTable(pdf, parentData, lastY + 10);
    
    // ===== DECLARATION SECTION =====
    pdf.setR2L(true);
    addSectionTitle(pdf, 'תוכן ההצהרה', lastY + 5);
    pdf.setR2L(false);
    
    const declarationItems = getDeclarationItems();
    const declarationData = declarationItems.map(item => ['•', item]);
    
    console.log("Creating declaration items table");
    lastY = createPlainTextTable(pdf, declarationData, lastY + 10);
    
    // ===== MEDICAL NOTES SECTION - SEPARATE SECTION =====
    // CRITICAL FIX: Parse medical notes with our improved parser
    const medicalNotes = parseMedicalNotes(healthDeclaration.notes);
    console.log("Parsed medical notes:", medicalNotes);
    
    pdf.setR2L(true);
    addSectionTitle(pdf, 'הערות רפואיות', lastY + 5);
    pdf.setR2L(false);
    
    // Display medical notes or default message
    const notesText = medicalNotes && medicalNotes.trim() !== '' 
      ? medicalNotes 
      : 'אין הערות רפואיות נוספות';
      
    lastY = createPlainTextTable(pdf, [[notesText]], lastY + 10);
    
    // ===== CONFIRMATION SECTION =====
    pdf.setR2L(true);
    addSectionTitle(pdf, 'אישור', lastY + 5);
    pdf.setR2L(false);
    
    lastY = createPlainTextTable(
      pdf, 
      [['אני מאשר/ת כי קראתי והבנתי את האמור לעיל ואני מצהיר/ה כי כל הפרטים שמסרתי הם נכונים.']], 
      lastY + 10
    );
    
    // ===== SIGNATURE SECTION =====
    // CRITICAL FIX: Use the parent name in the signature line if available
    pdf.setR2L(true); // Enable RTL for Hebrew text
    
    const signatureY = lastY + 15;
    if (parentInfo.parentName && parentInfo.parentName.trim() !== '') {
      // Use parent name in signature line
      pdf.text(`חתימת ההורה/אפוטרופוס: ${parentInfo.parentName}`, 30, signatureY);
    } else {
      // Default signature line
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
