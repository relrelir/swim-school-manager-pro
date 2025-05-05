
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
    // Reduce console.log calls for better performance
    // console.log("Starting PDF generation with enhanced bidirectional text handling");
    // console.log("Raw notes field:", healthDeclaration.notes);
    
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
    const fullName = `${participant.firstname} ${participant.lastname}`;
    
    // Create participant data table with improved formatting
    const participantData = [
      [fullName, 'שם מלא'], // Hebrew name - no special formatting needed
      [forceLtrDirection(participant.idnumber || ''), 'תעודת זהות'], // ID number needs LTR control
      [forceLtrDirection(participant.phone || ''), 'טלפון'], // Phone number needs LTR control
    ];
    
    // Reduce console.log call for performance
    // console.log("Creating participant data table");
    lastY = createDataTable(pdf, participantData, lastY + 5);
    
    // ===== PARENT/GUARDIAN SECTION - SEPARATE SECTION =====
    // Parse parent info with our improved parser - parseParentInfo is now more efficient
    const parentInfo = parseParentInfo(healthDeclaration.notes);
    // console.log("Parsed parent info:", parentInfo);
    
    // Add parent/guardian section with optimized spacing
    addSectionTitle(pdf, 'פרטי ההורה/אפוטרופוס', lastY + 5);
    
    // Create parent info table - Hebrew name and numeric ID
    const parentData = [
      [parentInfo.parentName ? parentInfo.parentName : 'לא צוין', 'שם מלא'], // Hebrew name - no special formatting
      [forceLtrDirection(parentInfo.parentId || 'לא צוין'), 'תעודת זהות'], // ID number needs LTR control
    ];
    
    // Reduce console.log call for performance
    // console.log("Parent name being used:", parentInfo.parentName || 'לא צוין');
    lastY = createDataTable(pdf, parentData, lastY + 10);
    
    // ===== DECLARATION SECTION =====
    addSectionTitle(pdf, 'תוכן ההצהרה', lastY + 5);
    
    const declarationItems = getDeclarationItems();
    // Hebrew declaration items with bullets
    const declarationData = declarationItems.map(item => [
      '•', 
      item // Hebrew text - no special formatting needed with global RTL
    ]);
    
    // Reduce console.log call for performance
    // console.log("Creating declaration items table");
    lastY = createPlainTextTable(pdf, declarationData, lastY + 10);
    
    // ===== MEDICAL NOTES SECTION - SEPARATE SECTION =====
    // Parse medical notes with our improved parser - parseMedicalNotes is now more efficient
    const medicalNotes = parseMedicalNotes(healthDeclaration.notes);
    // console.log("Parsed medical notes:", medicalNotes);
    
    addSectionTitle(pdf, 'הערות רפואיות', lastY + 5);
    
    // Display medical notes or default message
    const notesText = medicalNotes && medicalNotes.trim() !== '' 
      ? medicalNotes // Hebrew text - no special formatting needed with global RTL
      : 'אין הערות רפואיות נוספות';
      
    lastY = createPlainTextTable(pdf, [[notesText]], lastY + 10);
    
    // ===== CONFIRMATION SECTION =====
    addSectionTitle(pdf, 'אישור', lastY + 5);
    
    lastY = createPlainTextTable(
      pdf, 
      [['אני מאשר/ת כי קראתי והבנתי את האמור לעיל ואני מצהיר/ה כי כל הפרטים שמסרתי הם נכונים.']], 
      lastY + 10
    );
    
    // ===== SIGNATURE SECTION =====
    // Use the parent name in the signature line if available
    pdf.setR2L(true); // Ensure RTL is enabled for Hebrew text
    
    const signatureY = lastY + 15;
    if (parentInfo.parentName && parentInfo.parentName.trim() !== '') {
      // Use parent name in signature line
      pdf.text(`חתימת ההורה/אפוטרופוס: ${parentInfo.parentName}`, 30, signatureY);
    } else {
      // Default signature line
      pdf.text('חתימת ההורה/אפוטרופוס: ________________', 30, signatureY);
    }
    
    // Generate filename
    const fileName = `הצהרת_בריאות_${participant.firstname}_${participant.lastname}.pdf`;
    
    // Reduce console.log call for performance
    // console.log("PDF generation completed successfully");
    return fileName;
  } catch (error) {
    console.error('Error building PDF content:', error);
    throw error;
  }
};
