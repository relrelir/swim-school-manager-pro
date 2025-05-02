
import type { TDocumentDefinitions } from 'pdfmake/interfaces';

/**
 * Helper function to create a health declaration PDF definition
 */
export const createHealthDeclarationPdfDefinition = (
  healthDeclaration: any,
  participant: any
): Partial<TDocumentDefinitions> => {
  console.log("Creating health declaration PDF definition");
  
  // Parse parent info and medical notes from the healthDeclaration.notes if available
  const notes = healthDeclaration.notes || '';
  
  // Extract parent information if available
  let parentName = '';
  let parentId = '';
  
  const parentMatch = notes.match(/הורה\/אפוטרופוס: ([^,]+), ת\.ז\.: ([^\n]+)/);
  if (parentMatch) {
    parentName = parentMatch[1].trim();
    parentId = parentMatch[2].trim();
  }
  
  // Extract medical notes (everything after parent info)
  let medicalNotes = notes;
  if (parentMatch) {
    medicalNotes = notes.replace(/הורה\/אפוטרופוס: [^,]+, ת\.ז\.: [^\n]+\n\n/g, '').trim();
  }
  
  // Standard declaration items
  const declarationItems = [
    'אני מצהיר/ה כי בני/בתי בריא/ה ואין לי התנגדות לכך שישתתף/תשתתף בפעילות השחייה.',
    'אני מצהיר/ה כי לבני/בתי לא ידוע לי על מחלות או מגבלות רפואיות העלולות למנוע את השתתפותו/ה בפעילות השחייה.',
    'אני מתחייב/ת להודיע על כל שינוי במצבו/ה הרפואי של בני/בתי.',
    'ידוע לי כי האחריות למסירת מידע מלא על מצבו/ה הבריאותי של בני/בתי חלה עליי בלבד.'
  ];
  
  // Format the submission date if available
  const formattedDate = healthDeclaration.submission_date 
    ? new Date(healthDeclaration.submission_date).toLocaleDateString('he-IL') 
    : new Date().toLocaleDateString('he-IL');
  
  return {
    content: [
      // Title
      { 
        text: 'הצהרת בריאות', 
        style: 'header', 
        alignment: 'center'
      },
      // Date
      {
        text: `תאריך: ${formattedDate}`,
        alignment: 'left',
        margin: [0, 0, 0, 20] as [number, number, number, number]
      },
      // Participant details
      {
        text: 'פרטי המשתתף',
        style: 'sectionHeader',
        margin: [0, 10, 0, 10] as [number, number, number, number]
      },
      {
        table: {
          widths: ['30%', '70%'],
          body: [
            ['שם מלא', `${participant.firstname} ${participant.lastname}`],
            ['תעודת זהות', participant.idnumber],
            ['טלפון', participant.phone],
          ]
        },
        layout: 'lightHorizontalLines'
      },
      
      // Parent details if available
      ...(parentName || parentId ? [
        {
          text: 'פרטי ההורה/אפוטרופוס',
          style: 'sectionHeader',
          margin: [0, 20, 0, 10] as [number, number, number, number]
        },
        {
          table: {
            widths: ['30%', '70%'],
            body: [
              ['שם מלא', parentName],
              ['תעודת זהות', parentId],
            ]
          },
          layout: 'lightHorizontalLines'
        }
      ] : []),
      
      // Declaration text
      {
        text: 'תוכן ההצהרה',
        style: 'sectionHeader',
        margin: [0, 20, 0, 10] as [number, number, number, number]
      },
      {
        ul: declarationItems
      },
      
      // Medical notes if any
      ...(medicalNotes ? [
        {
          text: 'הערות רפואיות',
          style: 'sectionHeader',
          margin: [0, 20, 0, 10] as [number, number, number, number]
        },
        {
          text: medicalNotes
        }
      ] : []),
      
      // Confirmation and signature
      {
        text: 'אישור',
        style: 'sectionHeader',
        margin: [0, 20, 0, 10] as [number, number, number, number]
      },
      {
        text: 'אני מאשר/ת כי קראתי והבנתי את האמור לעיל ואני מצהיר/ה כי כל הפרטים שמסרתי הם נכונים.'
      },
      {
        text: 'חתימת ההורה/אפוטרופוס: ________________',
        margin: [0, 30, 0, 0] as [number, number, number, number]
      }
    ],
    styles: {
      header: {
        fontSize: 22,
        bold: true,
        margin: [0, 0, 0, 10] as [number, number, number, number]
      },
      sectionHeader: {
        fontSize: 14,
        bold: true,
      }
    }
  };
};
