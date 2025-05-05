
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
import { forceLtrDirection, forceRtlDirection } from './helpers/textDirection';

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
 */
export const buildHealthDeclarationPDF = (
  pdf: jsPDF, 
  healthDeclaration: HealthDeclarationData, 
  participant: ParticipantData
): string => {
  try {
    console.log("Starting PDF generation with enhanced bidirectional text handling");
    console.log("Raw notes field:", healthDeclaration.notes);
    
    // Add title with direct Hebrew support using RTL embedding
    addPdfTitle(pdf, 'הצהרת בריאות');
    
    // Add date with strong LTR embedding
    const formattedDate = healthDeclaration.submission_date 
      ? format(new Date(healthDeclaration.submission_date), 'dd/MM/yyyy HH:mm') 
      : format(new Date(), 'dd/MM/yyyy HH:mm');
    
    addPdfDate(pdf, forceLtrDirection(formattedDate));
    
    // Use more compact spacing to fit on one page
    const startY = 40;
    let lastY = startY;
    
    // ===== PARTICIPANT SECTION =====
    addSectionTitle(pdf, 'פרטי המשתתף', lastY);
    
    // Process participant data with explicit embedding
    const fullName = forceRtlDirection(`${participant.firstname} ${participant.lastname}`);
    
    // Numeric values need LTR embedding
    const idNumber = forceLtrDirection(participant.idnumber || '');
    const phone = forceLtrDirection(participant.phone || '');
    
    // Create participant data table with correct embedding
    const participantData = [
      [fullName, 'שם מלא'],
      [idNumber, 'תעודת זהות'],
      [phone, 'טלפון'],
    ];
    
    console.log("Creating participant data table");
    lastY = createDataTable(pdf, participantData, lastY + 5);
    
    // ===== PARENT/GUARDIAN SECTION =====
    const parentInfo = parseParentInfo(healthDeclaration.notes);
    console.log("Parsed parent info:", parentInfo);
    
    addSectionTitle(pdf, 'פרטי ההורה/אפוטרופוס', lastY + 5);
    
    // Create parent info table with RTL for names, LTR for IDs
    const parentData = [
      [parentInfo.parentName ? forceRtlDirection(parentInfo.parentName) : 'לא צוין', 'שם מלא'],
      [forceLtrDirection(parentInfo.parentId || 'לא צוין'), 'תעודת זהות'],
    ];
    
    console.log("Parent name being used:", parentInfo.parentName || 'לא צוין');
    lastY = createDataTable(pdf, parentData, lastY + 10);
    
    // ===== DECLARATION SECTION =====
    addSectionTitle(pdf, 'תוכן ההצהרה', lastY + 5);
    
    const declarationItems = getDeclarationItems();
    // Properly mark each declaration item with RTL embedding
    const declarationData = declarationItems.map(item => [
      '•', 
      forceRtlDirection(item)
    ]);
    
    console.log("Creating declaration items table");
    lastY = createPlainTextTable(pdf, declarationData, lastY + 10);
    
    // ===== MEDICAL NOTES SECTION =====
    const medicalNotes = parseMedicalNotes(healthDeclaration.notes);
    console.log("Parsed medical notes:", medicalNotes);
    
    addSectionTitle(pdf, 'הערות רפואיות', lastY + 5);
    
    // Display medical notes or default message with RTL embedding
    const notesText = medicalNotes && medicalNotes.trim() !== '' 
      ? forceRtlDirection(medicalNotes)
      : forceRtlDirection('אין הערות רפואיות נוספות');
      
    lastY = createPlainTextTable(pdf, [[notesText]], lastY + 10);
    
    // ===== CONFIRMATION SECTION =====
    addSectionTitle(pdf, 'אישור', lastY + 5);
    
    lastY = createPlainTextTable(
      pdf, 
      [[forceRtlDirection('אני מאשר/ת כי קראתי והבנתי את האמור לעיל ואני מצהיר/ה כי כל הפרטים שמסרתי הם נכונים.')]], 
      lastY + 10
    );
    
    // ===== SIGNATURE SECTION =====
    const signatureY = lastY + 15;
    
    // Add signature line with RTL embedding for Hebrew text
    if (parentInfo.parentName && parentInfo.parentName.trim() !== '') {
      // Use parent name in signature line with RTL embedding
      pdf.text(forceRtlDirection(`חתימת ההורה/אפוטרופוס: ${parentInfo.parentName}`), 30, signatureY);
    } else {
      // Default signature line with RTL embedding
      pdf.text(forceRtlDirection('חתימת ההורה/אפוטרופוס: ________________'), 30, signatureY);
    }
    
    // Generate filename
    const fileName = `הצהרת_בריאות_${participant.firstname}_${participant.lastname}.pdf`;
    
    console.log("PDF generation completed successfully");
    return fileName;
  } catch (error) {
    console.error('Error building PDF content:', error);
    throw error;
  }
};
