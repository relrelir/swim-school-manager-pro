
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
import { formatPdfField, forceRtlDirection } from './helpers/textFormatting';

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
    
    // CRITICAL FIX: Add title with direct Hebrew support using proper RTL embedding
    addPdfTitle(pdf, forceRtlDirection('הצהרת בריאות'));
    
    // Add date with strongest possible LTR embedding
    const formattedDate = healthDeclaration.submission_date 
      ? format(new Date(healthDeclaration.submission_date), 'dd/MM/yyyy HH:mm') 
      : format(new Date(), 'dd/MM/yyyy HH:mm');
    
    addPdfDate(pdf, forceLtrDirection(formattedDate));
    
    // Use more compact spacing to fit on one page
    const startY = 40;
    let lastY = startY;
    
    // ===== PARTICIPANT SECTION =====
    addSectionTitle(pdf, forceRtlDirection('פרטי המשתתף'), lastY);
    
    // Process participant data
    const fullName = `${participant.firstname} ${participant.lastname}`;
    
    // Create participant data table with improved formatting
    const participantData = [
      [formatPdfField(fullName), forceRtlDirection('שם מלא')],
      [forceLtrDirection(participant.idnumber || ''), forceRtlDirection('תעודת זהות')],
      [forceLtrDirection(participant.phone || ''), forceRtlDirection('טלפון')],
    ];
    
    console.log("Creating participant data table");
    lastY = createDataTable(pdf, participantData, lastY + 5);
    
    // ===== PARENT/GUARDIAN SECTION - SEPARATE SECTION =====
    // Parse parent info with our improved parser
    const parentInfo = parseParentInfo(healthDeclaration.notes);
    console.log("Parsed parent info:", parentInfo);
    
    // Add parent/guardian section with optimized spacing
    addSectionTitle(pdf, forceRtlDirection('פרטי ההורה/אפוטרופוס'), lastY + 5);
    
    // Create parent info table - using the correctly parsed parent name
    const parentData = [
      [parentInfo.parentName ? formatPdfField(parentInfo.parentName) : forceRtlDirection('לא צוין'), forceRtlDirection('שם מלא')],
      [forceLtrDirection(parentInfo.parentId || 'לא צוין'), forceRtlDirection('תעודת זהות')],
    ];
    
    console.log("Parent name being used:", parentInfo.parentName || 'לא צוין');
    lastY = createDataTable(pdf, parentData, lastY + 10);
    
    // ===== DECLARATION SECTION =====
    addSectionTitle(pdf, forceRtlDirection('תוכן ההצהרה'), lastY + 5);
    
    const declarationItems = getDeclarationItems();
    // Properly mark each declaration item with RTL embedding
    const declarationData = declarationItems.map(item => [
      forceRtlDirection('•'), 
      formatPdfField(item)
    ]);
    
    console.log("Creating declaration items table");
    lastY = createPlainTextTable(pdf, declarationData, lastY + 10);
    
    // ===== MEDICAL NOTES SECTION - SEPARATE SECTION =====
    // Parse medical notes with our improved parser
    const medicalNotes = parseMedicalNotes(healthDeclaration.notes);
    console.log("Parsed medical notes:", medicalNotes);
    
    addSectionTitle(pdf, forceRtlDirection('הערות רפואיות'), lastY + 5);
    
    // Display medical notes or default message with RTL embedding
    const notesText = medicalNotes && medicalNotes.trim() !== '' 
      ? formatPdfField(medicalNotes)
      : forceRtlDirection('אין הערות רפואיות נוספות');
      
    lastY = createPlainTextTable(pdf, [[notesText]], lastY + 10);
    
    // ===== CONFIRMATION SECTION =====
    addSectionTitle(pdf, forceRtlDirection('אישור'), lastY + 5);
    
    lastY = createPlainTextTable(
      pdf, 
      [[forceRtlDirection('אני מאשר/ת כי קראתי והבנתי את האמור לעיל ואני מצהיר/ה כי כל הפרטים שמסרתי הם נכונים.')]], 
      lastY + 10
    );
    
    // ===== SIGNATURE SECTION =====
    // Use the parent name in the signature line if available
    pdf.setR2L(true); // Enable RTL for Hebrew text
    
    const signatureY = lastY + 15;
    if (parentInfo.parentName && parentInfo.parentName.trim() !== '') {
      // Use parent name in signature line with RTL embedding
      pdf.text(forceRtlDirection(`חתימת ההורה/אפוטרופוס: ${parentInfo.parentName}`), 30, signatureY);
    } else {
      // Default signature line with RTL embedding
      pdf.text(forceRtlDirection('חתימת ההורה/אפוטרופוס: ________________'), 30, signatureY);
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
