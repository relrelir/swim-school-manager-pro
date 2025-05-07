
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import { 
  addPdfTitle, 
  addPdfDate, 
  addSectionTitle, 
  createDataTable,
  createPlainTextTable
} from './pdfHelpers';
import { parseMedicalNotes, getDeclarationItems } from './healthDeclarationParser';
import { forceLtrDirection } from './helpers/textDirection';
import { formatPdfField, forceRtlDirection } from './helpers/textFormatting';

interface ParticipantData {
  firstname: string;
  lastname: string;
  idnumber: string;
  phone: string;
  fullName?: string; // שדה אופציונלי שיתווסף בקובץ הקודם
}

interface HealthDeclarationData {
  id: string;
  participant_id: string;
  submission_date: string | null;
  notes: string | null;
  form_status: string;
  signature?: string | null; // Add signature field
  parent_name?: string;
parent_id?: string;

}

/**
 * Builds the content of a health declaration PDF with enhanced bidirectional text support
 */
export const buildHealthDeclarationPDF = (
  pdf: jsPDF, 
  healthDeclaration: HealthDeclarationData, 
  participant: ParticipantData
): string => {
  try {
    // Add title - Hebrew title works correctly with global RTL
    addPdfTitle(pdf, 'הצהרת בריאות');
    
    // Add date with proper direction control for numeric content
    const formattedDate = healthDeclaration.submission_date 
      ? format(new Date(healthDeclaration.submission_date), 'dd/MM/yyyy HH:mm') 
      : format(new Date(), 'dd/MM/yyyy HH:mm');
    
    addPdfDate(pdf, forceLtrDirection(formattedDate));
    
    // Use more compact spacing to fit on one page
    const startY = 40;
    let lastY = startY;
    
    // ===== PARTICIPANT SECTION =====
    addSectionTitle(pdf, 'פרטי המשתתף', lastY);
    
    // Process participant data
    const fullName = participant.fullName || `${participant.firstname} ${participant.lastname}`.trim();

    
    // Create participant data table with improved formatting
    const participantData = [
      [fullName, 'שם מלא'], // Hebrew name - no special formatting needed
      [forceLtrDirection(participant.idnumber || ''), 'תעודת זהות'], // ID number needs LTR control
      [forceLtrDirection(participant.phone || ''), 'טלפון'], // Phone number needs LTR control
    ];
    
    lastY = createDataTable(pdf, participantData, lastY + 5);
    
    // ===== PARENT/GUARDIAN SECTION - SEPARATE SECTION =====
    // Parse parent info with our improved parser - parseParentInfo is now more efficient
 const parentInfo = {
  parentName: healthDeclaration.parent_name || '',
  parentId: healthDeclaration.parent_id || ''
};

    
    // Add parent/guardian section with optimized spacing
    addSectionTitle(pdf, 'פרטי ההורה/אפוטרופוס', lastY + 5);
    
    // Create parent info table - Hebrew name and numeric ID
    const parentData = [
      [parentInfo.parentName ? parentInfo.parentName : 'לא צוין', 'שם מלא'], // Hebrew name - no special formatting
      [forceLtrDirection(parentInfo.parentId || 'לא צוין'), 'תעודת זהות'], // ID number needs LTR control
    ];
    
    lastY = createDataTable(pdf, parentData, lastY + 10);
    
    // ===== DECLARATION SECTION =====
    addSectionTitle(pdf, 'תוכן ההצהרה', lastY + 5);
    
    const declarationItems = getDeclarationItems();
    // Hebrew declaration items with bullets
    const declarationData = declarationItems.map(item => [
      '•', 
      item // Hebrew text - no special formatting needed with global RTL
    ]);
    
    lastY = createPlainTextTable(pdf, declarationData, lastY + 10);
    
    // ===== MEDICAL NOTES SECTION - SEPARATE SECTION =====
    // Clean the notes field before parsing medical notes
    const rawNotes = healthDeclaration.notes || '';
    // First clean up text by removing parent/guardian labels
    const cleanedText = rawNotes.replace(/הורה\/אפוטרופוס:?/g, '');
    
    // Parse medical notes with our improved parser
    const medicalNotes = parseMedicalNotes(cleanedText);
    
    addSectionTitle(pdf, 'הערות רפואיות', lastY + 5);
    
    // Display medical notes or default message
// const rawNotes = healthDeclaration.notes?.trim();
//const notesText = rawNotes && rawNotes !== ''
//  ? rawNotes
 // : 'אין הערות רפואיות נוספות';
const notesText = healthDeclaration.notes && healthDeclaration.notes.trim() !== ''
  ? healthDeclaration.notes.trim()
  : 'אין הערות רפואיות נוספות';

lastY = createPlainTextTable(pdf, [[notesText]], lastY + 10);

      
    lastY = createPlainTextTable(pdf, [[notesText]], lastY + 10);
    
    // ===== CONFIRMATION SECTION =====
    addSectionTitle(pdf, 'אישור', lastY + 5);
    
    lastY = createPlainTextTable(
      pdf, 
      [['אני מאשר/ת כי קראתי והבנתי את האמור לעיל ואני מצהיר/ה כי כל הפרטים שמסרתי הם נכונים.']], 
      lastY + 10
    );
    
    // ===== SIGNATURE SECTION =====
    addSectionTitle(pdf, 'חתימה', lastY + 5);
    
    const signatureY = lastY + 15;
    
    // Check if signature exists
    if (healthDeclaration.signature) {
      try {
        // Add signature image
        pdf.addImage(healthDeclaration.signature, 'PNG', 30, signatureY, 80, 30);
        
        // Add parent name below signature
        pdf.setR2L(true); // Ensure RTL is enabled for Hebrew text
        pdf.text(`חתימת ההורה/אפוטרופוס: ${parentInfo.parentName || ''}`, 30, signatureY + 35);
        pdf.setR2L(false);
      } catch (error) {
        console.error('Error adding signature to PDF:', error);
        
        // Fallback to text-only signature if image fails
        pdf.setR2L(true);
        if (parentInfo.parentName && parentInfo.parentName.trim() !== '') {
          pdf.text(`חתימת ההורה/אפוטרופוס: ${parentInfo.parentName}`, 30, signatureY);
        } else {
          pdf.text('חתימת ההורה/אפוטרופוס: ________________', 30, signatureY);
        }
        pdf.setR2L(false);
      }
    } else {
      // Use the parent name in the signature line if available
      pdf.setR2L(true); // Ensure RTL is enabled for Hebrew text
      
      if (parentInfo.parentName && parentInfo.parentName.trim() !== '') {
        // Use parent name in signature line
        pdf.text(`חתימת ההורה/אפוטרופוס: ${parentInfo.parentName}`, 30, signatureY);
      } else {
        // Default signature line
        pdf.text('חתימת ההורה/אפוטרופוס: ________________', 30, signatureY);
      }
      pdf.setR2L(false);
    }
    
    // Generate filename
    const fileName = `הצהרת_בריאות_${participant.firstname}_${participant.lastname}.pdf`;
    
    return fileName;
  } catch (error) {
    console.error('Error building PDF content:', error);
    throw error;
  }
};
