
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
import { encodeHebrewText } from './hebrewTextHelper';

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
 */
export const buildHealthDeclarationPDF = (
  pdf: jsPDF, 
  healthDeclaration: HealthDeclarationData, 
  participant: ParticipantData
): string => {
  try {
    // Add title
    addPdfTitle(pdf, encodeHebrewText('הצהרת בריאות'));
    
    // Add date
    const formattedDate = healthDeclaration.submission_date 
      ? format(new Date(healthDeclaration.submission_date), 'dd/MM/yyyy HH:mm') 
      : format(new Date(), 'dd/MM/yyyy HH:mm');
    
    addPdfDate(pdf, encodeHebrewText(formattedDate));
    
    // Add participant details
    addSectionTitle(pdf, encodeHebrewText('פרטי המשתתף'), 45);
    
    const participantData = [
      [encodeHebrewText('שם מלא'), encodeHebrewText(`${participant.firstname} ${participant.lastname}`)],
      [encodeHebrewText('תעודת זהות'), participant.idnumber],
      [encodeHebrewText('טלפון'), participant.phone],
    ];
    
    let lastY = createDataTable(pdf, participantData, 50);
    
    // Add parent details if available
    const parentInfo = parseParentInfo(healthDeclaration.notes);
    
    if (parentInfo.parentName || parentInfo.parentId) {
      addSectionTitle(pdf, encodeHebrewText('פרטי ההורה/אפוטרופוס'), lastY + 15);
      
      const parentData = [
        [encodeHebrewText('שם מלא'), encodeHebrewText(parentInfo.parentName || '')],
        [encodeHebrewText('תעודת זהות'), parentInfo.parentId || ''],
      ];
      
      lastY = createDataTable(pdf, parentData, lastY + 20);
    }
    
    // Add declaration text
    addSectionTitle(pdf, encodeHebrewText('תוכן ההצהרה'), lastY + 15);
    
    const declarationItems = getDeclarationItems();
    const declarationData = declarationItems.map(item => [
      encodeHebrewText('•'), 
      encodeHebrewText(item)
    ]);
    
    lastY = createPlainTextTable(pdf, declarationData, lastY + 20, {
      0: { cellWidth: 5 },
      1: { cellWidth: 'auto' },
    });
    
    // Add medical notes if any
    if (healthDeclaration.notes) {
      const medicalNotes = parseMedicalNotes(healthDeclaration.notes);
      
      if (medicalNotes) {
        addSectionTitle(pdf, encodeHebrewText('הערות רפואיות'), lastY + 15);
        
        lastY = createPlainTextTable(pdf, [[encodeHebrewText(medicalNotes)]], lastY + 20);
      }
    }
    
    // Add confirmation
    addSectionTitle(pdf, encodeHebrewText('אישור'), lastY + 15);
    
    lastY = createPlainTextTable(pdf, [[encodeHebrewText('אני מאשר/ת כי קראתי והבנתי את האמור לעיל ואני מצהיר/ה כי כל הפרטים שמסרתי הם נכונים.')]], lastY + 20);
    
    // Add signature line
    pdf.text(encodeHebrewText('חתימת ההורה/אפוטרופוס: ________________'), 30, lastY + 20);
    
    // Generate filename
    const fileName = `הצהרת_בריאות_${participant.firstname}_${participant.lastname}.pdf`;
    
    return fileName;
  } catch (error) {
    console.error('Error building PDF content:', error);
    throw error;
  }
};
