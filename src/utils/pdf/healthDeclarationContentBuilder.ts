
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
 * Using stronger direction control for numeric content
 */
export const buildHealthDeclarationPDF = (
  pdf: jsPDF, 
  healthDeclaration: HealthDeclarationData, 
  participant: ParticipantData
): string => {
  try {
    console.log("Starting PDF generation with enhanced bidirectional text handling");
    console.log("Raw notes field:", healthDeclaration.notes);
    
    // Add title with direct Hebrew support - control RTL only for this element
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
    
    // Create participant data table with improved formatting
    // ID number and phone use strong LTR embedding
    const participantData = [
      [`\u200F${fullName}\u200F`, 'שם מלא'],
      [forceLtrDirection(participant.idnumber || ''), 'תעודת זהות'],
      [forceLtrDirection(participant.phone || ''), 'טלפון'],
    ];
    
    console.log("Creating participant data table");
    lastY = createDataTable(pdf, participantData, lastY + 5);
    
    // ===== PARENT/GUARDIAN SECTION - SEPARATE SECTION =====
    const parentInfo = parseParentInfo(healthDeclaration.notes);
    console.log("Parsed parent info:", parentInfo);
    
    // Add parent/guardian section with optimized spacing
    pdf.setR2L(true);
    addSectionTitle(pdf, 'פרטי ההורה/אפוטרופוס', lastY + 5);
    pdf.setR2L(false);
    
    // Create parent info table - using stronger direction control
    const parentData = [
      [parentInfo.parentName ? `\u200F${parentInfo.parentName}\u200F` : 'לא צוין', 'שם מלא'],
      [forceLtrDirection(parentInfo.parentId || 'לא צוין'), 'תעודת זהות'],
    ];
    
    console.log("Parent name being used:", parentInfo.parentName || 'לא צוין');
    lastY = createDataTable(pdf, parentData, lastY + 10);
    
    // ===== DECLARATION SECTION =====
    pdf.setR2L(true);
    addSectionTitle(pdf, 'תוכן ההצהרה', lastY + 5);
    pdf.setR2L(false);
    
    const declarationItems = getDeclarationItems();
    // Mark each declaration item with RTL markers
    const declarationData = declarationItems.map(item => [
      '•', 
      `\u200F${item}\u200F`
    ]);
    
    console.log("Creating declaration items table");
    lastY = createPlainTextTable(pdf, declarationData, lastY + 10);
    
    // ===== MEDICAL NOTES SECTION - SEPARATE SECTION =====
    const medicalNotes = parseMedicalNotes(healthDeclaration.notes);
    console.log("Parsed medical notes:", medicalNotes);
    
    pdf.setR2L(true);
    addSectionTitle(pdf, 'הערות רפואיות', lastY + 5);
    pdf.setR2L(false);
    
    // Display medical notes or default message with RTL markers
    const notesText = medicalNotes && medicalNotes.trim() !== '' 
      ? `\u200F${medicalNotes}\u200F`
      : '\u200Fאין הערות רפואיות נוספות\u200F';
      
    lastY = createPlainTextTable(pdf, [[notesText]], lastY + 10);
    
    // ===== CONFIRMATION SECTION =====
    pdf.setR2L(true);
    addSectionTitle(pdf, 'אישור', lastY + 5);
    pdf.setR2L(false);
    
    lastY = createPlainTextTable(
      pdf, 
      [['\u200Fאני מאשר/ת כי קראתי והבנתי את האמור לעיל ואני מצהיר/ה כי כל הפרטים שמסרתי הם נכונים.\u200F']], 
      lastY + 10
    );
    
    // ===== SIGNATURE SECTION =====
    // Use the parent name in the signature line if available
    pdf.setR2L(true); // Enable RTL for Hebrew text
    
    const signatureY = lastY + 15;
    if (parentInfo.parentName && parentInfo.parentName.trim() !== '') {
      // Use parent name in signature line with RTL marks
      pdf.text(`\u200Fחתימת ההורה/אפוטרופוס: ${parentInfo.parentName}\u200F`, 30, signatureY);
    } else {
      // Default signature line with RTL marks
      pdf.text('\u200Fחתימת ההורה/אפוטרופוס: ________________\u200F', 30, signatureY);
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
