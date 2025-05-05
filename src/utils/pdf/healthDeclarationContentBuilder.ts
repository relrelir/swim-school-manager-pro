
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
 * CRITICAL FIX: Optimized to properly display Hebrew text and numbers without reversing
 */
export const buildHealthDeclarationPDF = (
  pdf: jsPDF, 
  healthDeclaration: HealthDeclarationData, 
  participant: ParticipantData
): string => {
  try {
    console.log("Starting PDF generation with enhanced bidirectional text handling");
    console.log("Raw notes field:", healthDeclaration.notes);
    
    // Add title with direct Hebrew support using RTL embedding for the document context
    pdf.setR2L(true); // Enable RTL only for the title
    addPdfTitle(pdf, '\u202B' + 'הצהרת בריאות' + '\u202C');
    pdf.setR2L(false);
    
    // Add date with strongest possible LTR embedding
    const formattedDate = healthDeclaration.submission_date 
      ? format(new Date(healthDeclaration.submission_date), 'dd/MM/yyyy HH:mm') 
      : format(new Date(), 'dd/MM/yyyy HH:mm');
    
    addPdfDate(pdf, forceLtrDirection(formattedDate));
    
    // Use more compact spacing to fit on one page
    const startY = 40;
    let lastY = startY;
    
    // ===== PARTICIPANT SECTION =====
    pdf.setR2L(true); // Enable RTL for section titles
    addSectionTitle(pdf, '\u202B' + 'פרטי המשתתף' + '\u202C');
    pdf.setR2L(false);
    
    // Process participant data
    const fullName = `${participant.firstname} ${participant.lastname}`;
    
    // Create participant data table with improved formatting and strong direction control
    const participantData = [
      [`\u202B${fullName}\u202C`, '\u202Bשם מלא\u202C'],
      [forceLtrDirection(participant.idnumber || ''), '\u202Bתעודת זהות\u202C'],
      [forceLtrDirection(participant.phone || ''), '\u202Bטלפון\u202C'],
    ];
    
    console.log("Creating participant data table");
    lastY = createDataTable(pdf, participantData, lastY + 5);
    
    // ===== PARENT/GUARDIAN SECTION - SEPARATE SECTION =====
    const parentInfo = parseParentInfo(healthDeclaration.notes);
    console.log("Parsed parent info:", parentInfo);
    
    // Add parent/guardian section with optimized spacing
    pdf.setR2L(true);
    addSectionTitle(pdf, '\u202B' + 'פרטי ההורה/אפוטרופוס' + '\u202C');
    pdf.setR2L(false);
    
    // Create parent info table with strong direction control
    const parentData = [
      [parentInfo.parentName ? `\u202B${parentInfo.parentName}\u202C` : '\u202Bלא צוין\u202C', '\u202Bשם מלא\u202C'],
      [forceLtrDirection(parentInfo.parentId || 'לא צוין'), '\u202Bתעודת זהות\u202C'],
    ];
    
    console.log("Parent name being used:", parentInfo.parentName || 'לא צוין');
    lastY = createDataTable(pdf, parentData, lastY + 10);
    
    // ===== DECLARATION SECTION =====
    pdf.setR2L(true);
    addSectionTitle(pdf, '\u202B' + 'תוכן ההצהרה' + '\u202C');
    pdf.setR2L(false);
    
    const declarationItems = getDeclarationItems();
    // Mark each declaration item with RTL embedding
    const declarationData = declarationItems.map(item => [
      '•', 
      `\u202B${item}\u202C`
    ]);
    
    console.log("Creating declaration items table");
    lastY = createPlainTextTable(pdf, declarationData, lastY + 10);
    
    // ===== MEDICAL NOTES SECTION - SEPARATE SECTION =====
    const medicalNotes = parseMedicalNotes(healthDeclaration.notes);
    console.log("Parsed medical notes:", medicalNotes);
    
    pdf.setR2L(true);
    addSectionTitle(pdf, '\u202B' + 'הערות רפואיות' + '\u202C');
    pdf.setR2L(false);
    
    // Display medical notes or default message with RTL embedding
    const notesText = medicalNotes && medicalNotes.trim() !== '' 
      ? `\u202B${medicalNotes}\u202C`
      : '\u202Bאין הערות רפואיות נוספות\u202C';
      
    lastY = createPlainTextTable(pdf, [[notesText]], lastY + 10);
    
    // ===== CONFIRMATION SECTION =====
    pdf.setR2L(true);
    addSectionTitle(pdf, '\u202B' + 'אישור' + '\u202C');
    pdf.setR2L(false);
    
    lastY = createPlainTextTable(
      pdf, 
      [['\u202Bאני מאשר/ת כי קראתי והבנתי את האמור לעיל ואני מצהיר/ה כי כל הפרטים שמסרתי הם נכונים.\u202C']], 
      lastY + 10
    );
    
    // ===== SIGNATURE SECTION =====
    pdf.setR2L(true); // Enable RTL for Hebrew text
    
    const signatureY = lastY + 15;
    if (parentInfo.parentName && parentInfo.parentName.trim() !== '') {
      // Use parent name in signature line with RTL embedding
      pdf.text(`\u202Bחתימת ההורה/אפוטרופוס: ${parentInfo.parentName}\u202C`, 30, signatureY);
    } else {
      // Default signature line with RTL embedding
      pdf.text('\u202Bחתימת ההורה/אפוטרופוס: ________________\u202C', 30, signatureY);
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
