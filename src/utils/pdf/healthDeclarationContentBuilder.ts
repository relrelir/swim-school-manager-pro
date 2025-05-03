
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
import { applyStrongDirectionalControl } from './hebrewTextHelper';

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
 * Builds the content of a health declaration PDF with Hebrew support
 * With enhanced text direction handling for mixed content
 */
export const buildHealthDeclarationPDF = (
  pdf: jsPDF, 
  healthDeclaration: HealthDeclarationData, 
  participant: ParticipantData
): string => {
  try {
    console.log("Starting PDF generation with data:", { participant });
    
    // Add title
    addPdfTitle(pdf, 'הצהרת בריאות');
    
    // Add date with enhanced direction control
    const formattedDate = healthDeclaration.submission_date 
      ? applyStrongDirectionalControl(format(new Date(healthDeclaration.submission_date), 'dd/MM/yyyy HH:mm'))
      : applyStrongDirectionalControl(format(new Date(), 'dd/MM/yyyy HH:mm'));
    
    addPdfDate(pdf, formattedDate);
    
    // Add participant details
    addSectionTitle(pdf, 'פרטי המשתתף', 45);
    
    // Apply enhanced direction control for all participant data
    const participantData = [
      ['שם מלא', applyStrongDirectionalControl(`${participant.firstname} ${participant.lastname}`)],
      ['תעודת זהות', applyStrongDirectionalControl(participant.idnumber)],
      ['טלפון', applyStrongDirectionalControl(participant.phone)],
    ];
    
    console.log("Creating participant data table");
    let lastY = createDataTable(pdf, participantData, 50);
    
    // Add parent details if available
    const parentInfo = parseParentInfo(healthDeclaration.notes);
    
    if (parentInfo.parentName || parentInfo.parentId) {
      addSectionTitle(pdf, 'פרטי ההורה/אפוטרופוס', lastY + 15);
      
      // Apply enhanced direction control for parent data
      const parentData = [
        ['שם מלא', parentInfo.parentName ? applyStrongDirectionalControl(parentInfo.parentName) : ''],
        ['תעודת זהות', parentInfo.parentId ? applyStrongDirectionalControl(parentInfo.parentId) : ''],
      ];
      
      lastY = createDataTable(pdf, parentData, lastY + 20);
    }
    
    // Add declaration text
    addSectionTitle(pdf, 'תוכן ההצהרה', lastY + 15);
    
    const declarationItems = getDeclarationItems();
    const declarationData = declarationItems.map(item => [
      '•', 
      item
    ]);
    
    console.log("Creating declaration items table");
    lastY = createPlainTextTable(pdf, declarationData, lastY + 20);
    
    // Add medical notes if any
    if (healthDeclaration.notes) {
      const medicalNotes = parseMedicalNotes(healthDeclaration.notes);
      
      if (medicalNotes) {
        addSectionTitle(pdf, 'הערות רפואיות', lastY + 15);
        
        lastY = createPlainTextTable(pdf, [[medicalNotes]], lastY + 20);
      }
    }
    
    // Add confirmation
    addSectionTitle(pdf, 'אישור', lastY + 15);
    
    lastY = createPlainTextTable(pdf, [['אני מאשר/ת כי קראתי והבנתי את האמור לעיל ואני מצהיר/ה כי כל הפרטים שמסרתי הם נכונים.']], lastY + 20);
    
    // Add signature line
    pdf.text('חתימת ההורה/אפוטרופוס: ________________', 30, lastY + 20);
    
    // Generate filename
    const fileName = `הצהרת_בריאות_${participant.firstname}_${participant.lastname}.pdf`;
    
    console.log("PDF generation completed successfully");
    return fileName;
  } catch (error) {
    console.error('Error building PDF content:', error);
    throw error;
  }
};
