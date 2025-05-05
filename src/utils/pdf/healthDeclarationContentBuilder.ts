
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
import { formatPdfField } from './helpers/textFormatting';

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
 * Builds the content of a health declaration PDF with properly formatted bidirectional text
 * Using formatPdfField to handle different content types correctly
 */
export const buildHealthDeclarationPDF = (
  pdf: jsPDF, 
  healthDeclaration: HealthDeclarationData, 
  participant: ParticipantData
): string => {
  try {
    console.log("Starting PDF generation with enhanced bidirectional text handling");
    console.log("Raw notes field:", healthDeclaration.notes);
    
    // Add title with direct Hebrew support
    addPdfTitle(pdf, formatPdfField('הצהרת בריאות', 'text'));
    
    // Add date with LTR control
    const formattedDate = healthDeclaration.submission_date 
      ? format(new Date(healthDeclaration.submission_date), 'dd/MM/yyyy HH:mm') 
      : format(new Date(), 'dd/MM/yyyy HH:mm');
    
    addPdfDate(pdf, formatPdfField(formattedDate, 'number'));
    
    // Use more compact spacing to fit on one page
    const startY = 40;
    let lastY = startY;
    
    // ===== PARTICIPANT SECTION =====
    addSectionTitle(pdf, formatPdfField('פרטי המשתתף', 'text'), lastY);
    
    // Process participant data with proper formatting
    const fullName = `${participant.firstname} ${participant.lastname}`;
    
    // Create participant data table with proper formatting
    const participantData = [
      [formatPdfField(fullName, 'text'), formatPdfField('שם מלא', 'text')],
      [formatPdfField(participant.idnumber || '', 'number'), formatPdfField('תעודת זהות', 'text')],
      [formatPdfField(participant.phone || '', 'number'), formatPdfField('טלפון', 'text')],
    ];
    
    console.log("Creating participant data table");
    lastY = createDataTable(pdf, participantData, lastY + 5);
    
    // ===== PARENT/GUARDIAN SECTION =====
    const parentInfo = parseParentInfo(healthDeclaration.notes);
    console.log("Parsed parent info:", parentInfo);
    
    addSectionTitle(pdf, formatPdfField('פרטי ההורה/אפוטרופוס', 'text'), lastY + 5);
    
    // Create parent info table with proper formatting
    const parentData = [
      [
        formatPdfField(parentInfo.parentName || 'לא צוין', 'text'), 
        formatPdfField('שם מלא', 'text')
      ],
      [
        formatPdfField(parentInfo.parentId || 'לא צוין', 'number'), 
        formatPdfField('תעודת זהות', 'text')
      ],
    ];
    
    console.log("Parent name being used:", parentInfo.parentName || 'לא צוין');
    lastY = createDataTable(pdf, parentData, lastY + 10);
    
    // ===== DECLARATION SECTION =====
    addSectionTitle(pdf, formatPdfField('תוכן ההצהרה', 'text'), lastY + 5);
    
    const declarationItems = getDeclarationItems();
    // Format each declaration item with RTL markers
    const declarationData = declarationItems.map(item => [
      '•', 
      formatPdfField(item, 'text')
    ]);
    
    console.log("Creating declaration items table");
    lastY = createPlainTextTable(pdf, declarationData, lastY + 10);
    
    // ===== MEDICAL NOTES SECTION =====
    const medicalNotes = parseMedicalNotes(healthDeclaration.notes);
    console.log("Parsed medical notes:", medicalNotes);
    
    addSectionTitle(pdf, formatPdfField('הערות רפואיות', 'text'), lastY + 5);
    
    // Display medical notes or default message with RTL markers
    const notesText = medicalNotes && medicalNotes.trim() !== '' 
      ? formatPdfField(medicalNotes, 'text')
      : formatPdfField('אין הערות רפואיות נוספות', 'text');
      
    lastY = createPlainTextTable(pdf, [[notesText]], lastY + 10);
    
    // ===== CONFIRMATION SECTION =====
    addSectionTitle(pdf, formatPdfField('אישור', 'text'), lastY + 5);
    
    lastY = createPlainTextTable(
      pdf, 
      [[formatPdfField('אני מאשר/ת כי קראתי והבנתי את האמור לעיל ואני מצהיר/ה כי כל הפרטים שמסרתי הם נכונים.', 'text')]], 
      lastY + 10
    );
    
    // ===== SIGNATURE SECTION =====
    // Use the parent name in the signature line if available
    
    const signatureY = lastY + 15;
    if (parentInfo.parentName && parentInfo.parentName.trim() !== '') {
      // Use parent name in signature line with RTL marks
      pdf.text(
        formatPdfField(`חתימת ההורה/אפוטרופוס: ${parentInfo.parentName}`, 'text'), 
        30, 
        signatureY, 
        { align: 'right' }
      );
    } else {
      // Default signature line with RTL marks
      pdf.text(
        formatPdfField('חתימת ההורה/אפוטרופוס: ________________', 'text'), 
        30, 
        signatureY, 
        { align: 'right' }
      );
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
