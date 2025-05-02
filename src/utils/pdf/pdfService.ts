
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import type { TDocumentDefinitions } from 'pdfmake/interfaces';
import { alefFontBase64 } from './alefFontData';

// Initialize pdfMake with the default fonts
pdfMake.vfs = pdfFonts.pdfMake.vfs;

// Add the Alef font to pdfMake's virtual file system
if (alefFontBase64 && alefFontBase64 !== "REPLACE_WITH_ACTUAL_ALEF_FONT_BASE64") {
  // Only add if we have valid base64 data
  pdfMake.vfs['Alef-Regular.ttf'] = alefFontBase64;

  // Register the font
  pdfMake.fonts = {
    ...pdfMake.fonts,
    Alef: {
      normal: 'Alef-Regular.ttf',
      bold: 'Alef-Regular.ttf',
      italics: 'Alef-Regular.ttf',
      bolditalics: 'Alef-Regular.ttf',
    },
  };
}

/**
 * Helper function to create and download a PDF
 * @param docDefinition The PDF document definition
 * @param fileName The name for the downloaded file
 * @param download Whether to download the file or return a promise
 * @returns A promise that resolves when the download is complete
 */
export const makePdf = async (
  docDefinition: Partial<TDocumentDefinitions>,
  fileName: string,
  download = true
): Promise<void | Buffer> => {
  const fullDocDefinition: TDocumentDefinitions = {
    pageSize: 'A4',
    pageOrientation: 'portrait',
    pageMargins: [40, 60, 40, 60],
    defaultStyle: { font: alefFontBase64 && alefFontBase64 !== "REPLACE_WITH_ACTUAL_ALEF_FONT_BASE64" ? 'Alef' : 'Helvetica' },
    // Use RTL layout for Hebrew
    rightToLeft: true,
    ...docDefinition,
  };

  const pdf = pdfMake.createPdf(fullDocDefinition);

  if (download && typeof window !== 'undefined') {
    return new Promise<void>((resolve) => {
      pdf.getBlob((blob: Blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        resolve();
      });
    });
  } else {
    // For server-side rendering or when download is not needed
    return new Promise<Buffer>((resolve) => {
      pdf.getBuffer((buffer: Buffer) => {
        resolve(buffer);
      });
    });
  }
};

/**
 * Helper function to create a registration PDF definition
 */
export const createRegistrationPdfDefinition = (
  registration: any,
  participant: any,
  payments: any[],
  productName: string
): Partial<TDocumentDefinitions> => {
  console.log("Creating registration PDF definition");
  
  // Calculate some values for the PDF
  const registrationDate = registration.registrationDate ? new Date(registration.registrationDate).toLocaleDateString('he-IL') : '';
  const discountAmount = registration.discountAmount || 0;
  const effectiveRequiredAmount = Math.max(0, registration.requiredAmount - (registration.discountApproved ? discountAmount : 0));
  
  // Create payment rows for the table
  const paymentRows = payments.map(payment => [
    new Date(payment.paymentDate).toLocaleDateString('he-IL'),
    payment.receiptNumber || '',
    payment.amount.toLocaleString('he-IL', { style: 'currency', currency: 'ILS' })
  ]);
  
  return {
    content: [
      // Title
      { 
        text: 'אישור רישום למוצר', 
        style: 'header',
        alignment: 'center'
      },
      // Product name
      {
        text: `מוצר: ${productName}`,
        style: 'subheader',
        alignment: 'center',
        margin: [0, 0, 0, 20] as [number, number, number, number]
      },
      // Participant section
      {
        text: 'פרטי משתתף:',
        style: 'sectionHeader',
        margin: [0, 20, 0, 10] as [number, number, number, number]
      },
      {
        table: {
          widths: ['30%', '70%'],
          body: [
            ['שם מלא:', `${participant.firstName} ${participant.lastName}`],
            ['תעודת זהות:', participant.idNumber],
            ['טלפון:', participant.phone]
          ]
        },
        layout: 'lightHorizontalLines'
      },
      // Registration details section
      {
        text: 'פרטי רישום:',
        style: 'sectionHeader',
        margin: [0, 20, 0, 10] as [number, number, number, number]
      },
      {
        table: {
          widths: ['30%', '70%'],
          body: [
            ['תאריך רישום:', registrationDate],
            ['סכום מקורי:', registration.requiredAmount.toLocaleString('he-IL', { style: 'currency', currency: 'ILS' })],
            ['הנחה:', registration.discountApproved ? 
              discountAmount.toLocaleString('he-IL', { style: 'currency', currency: 'ILS' }) : 'לא'],
            ['סכום לתשלום:', effectiveRequiredAmount.toLocaleString('he-IL', { style: 'currency', currency: 'ILS' })],
            ['סכום ששולם:', registration.paidAmount.toLocaleString('he-IL', { style: 'currency', currency: 'ILS' })]
          ]
        },
        layout: 'lightHorizontalLines'
      },
      
      // Payments section (if there are any)
      ...(payments.length > 0 ? [
        {
          text: 'פרטי תשלומים:',
          style: 'sectionHeader',
          margin: [0, 20, 0, 10] as [number, number, number, number]
        },
        {
          table: {
            headerRows: 1,
            widths: ['33%', '33%', '34%'],
            body: [
              ['תאריך תשלום', 'מספר קבלה', 'סכום'],
              ...paymentRows
            ]
          },
          layout: 'lightHorizontalLines'
        }
      ] : []),
      
      // Footer
      {
        text: 'מסמך זה מהווה אישור רשמי על רישום ותשלום.',
        style: 'footer',
        margin: [0, 30, 0, 0] as [number, number, number, number],
        alignment: 'center'
      }
    ],
    styles: {
      header: {
        fontSize: 22,
        bold: true,
        margin: [0, 0, 0, 10] as [number, number, number, number]
      },
      subheader: {
        fontSize: 16,
        margin: [0, 10, 0, 5] as [number, number, number, number]
      },
      sectionHeader: {
        fontSize: 14,
        bold: true,
      },
      footer: {
        fontSize: 10,
        italics: true
      }
    }
  };
};

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
      },
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
