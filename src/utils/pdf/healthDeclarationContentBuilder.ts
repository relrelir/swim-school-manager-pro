
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
import { forceLtrDirection } from './hebrewTextHelper';

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
 * Validates if a string contains only digits or is a valid ID number format
 */
const isValidIdNumber = (id: string | null | undefined): boolean => {
  if (!id) return false;
  // Allow only digits, possibly with dashes or spaces as separators
  return /^[\d\s\-]+$/.test(id);
};

/**
 * Format phone number for display
 */
const formatPhoneNumber = (phone: string | null | undefined): string => {
  if (!phone) return '';
  // Clean up any formatting and keep only digits
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 9) return phone; // Return original if too short
  
  return digits;
};

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
    console.log("Participant data:", participant);
    
    // Add title - Hebrew content with RTL
    addPdfTitle(pdf, 'הצהרת בריאות');
    
    // Add date with strongest possible LTR control
    const formattedDate = healthDeclaration.submission_date 
      ? format(new Date(healthDeclaration.submission_date), 'dd/MM/yyyy HH:mm') 
      : format(new Date(), 'dd/MM/yyyy HH:mm');
    
    addPdfDate(pdf, forceLtrDirection(formattedDate));
    
    // Add participant details - Hebrew section title
    addSectionTitle(pdf, 'פרטי המשתתף', 45);
    
    // Process participant data with appropriate direction control and validation
    const fullName = `${participant.firstname} ${participant.lastname}`;
    console.log("Full name:", fullName);
    
    // Validate ID number
    const idNumber = isValidIdNumber(participant.idnumber) 
      ? forceLtrDirection(participant.idnumber) 
      : 'לא צוין';
    console.log("ID number:", idNumber);
    
    // Format phone number
    const phoneNumber = participant.phone 
      ? forceLtrDirection(formatPhoneNumber(participant.phone)) 
      : 'לא צוין';
    console.log("Phone number:", phoneNumber);
    
    // FIXED: Switched column order - labels in right column (first element), data in left column (second element)
    // This matches the structure used in the registration PDF that's working correctly
    const participantData = [
      ['שם מלא', fullName],
      ['תעודת זהות', idNumber],
      ['טלפון', phoneNumber],
    ];
    
    console.log("Creating participant data table with correct column order");
    let lastY = createDataTable(pdf, participantData, 50);
    
    // Add parent details if available
    const parentInfo = parseParentInfo(healthDeclaration.notes);
    
    if (parentInfo.parentName || parentInfo.parentId) {
      addSectionTitle(pdf, 'פרטי ההורה/אפוטרופוס', lastY + 15);
      
      // Validate parent ID
      const parentIdDisplay = isValidIdNumber(parentInfo.parentId) 
        ? forceLtrDirection(parentInfo.parentId) 
        : 'לא צוין';
      
      // FIXED: Switched column order - labels in right column (first), data in left column (second)
      const parentData = [
        ['שם מלא', parentInfo.parentName || 'לא צוין'],
        ['תעודת זהות', parentIdDisplay],
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
    pdf.setR2L(true); // Enable RTL for Hebrew text
    pdf.text('חתימת ההורה/אפוטרופוס: ________________', 30, lastY + 20);
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
