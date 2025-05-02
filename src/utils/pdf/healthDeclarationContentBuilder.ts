
import { format } from 'date-fns';
import { getDeclarationItems } from '../healthDeclarationParser';
import type { Content, StyleDictionary } from 'pdfmake/interfaces';
import { HealthDeclarationPdfData } from './healthDeclaration/healthDeclarationDataFetcher';

interface PdfContentResult {
  content: Content[];
  styles: StyleDictionary;
  fileName: string;
}

/**
 * Builds the content for a health declaration PDF
 */
export const buildHealthDeclarationContent = (data: HealthDeclarationPdfData): PdfContentResult => {
  try {
    console.log("Building health declaration PDF content with data:", data);
    
    // Prepare the content array with proper type casting
    const contentItems: Content[] = [];
    
    // Add title
    contentItems.push({ 
      text: 'הצהרת בריאות', 
      style: 'header', 
      alignment: 'center' 
    });
    
    // Add date
    contentItems.push({ 
      text: `תאריך: ${data.declaration.submissionDate}`, 
      alignment: 'left', 
      margin: [0, 0, 0, 20] 
    });
    
    // Add participant section
    contentItems.push({ 
      text: 'פרטי המשתתף', 
      style: 'subheader', 
      margin: [0, 10, 0, 10] 
    });
    
    // Add participant table
    contentItems.push({
      table: {
        headerRows: 1,
        widths: ['*', '*', '*'],
        body: [
          [
            { text: 'שם מלא', style: 'tableHeader', alignment: 'right' },
            { text: 'תעודת זהות', style: 'tableHeader', alignment: 'right' },
            { text: 'טלפון', style: 'tableHeader', alignment: 'right' }
          ],
          [
            { text: data.participant.fullName, alignment: 'right' },
            { text: data.participant.idNumber, alignment: 'right' },
            { text: data.participant.phone, alignment: 'right' }
          ]
        ]
      },
      layout: 'lightHorizontalLines',
      margin: [0, 0, 0, 20]
    });
    
    // Add parent section if available
    if (data.parentInfo.parentName || data.parentInfo.parentId) {
      contentItems.push({ 
        text: 'פרטי ההורה/אפוטרופוס', 
        style: 'subheader', 
        margin: [0, 10, 0, 10] 
      });
      
      contentItems.push({
        table: {
          headerRows: 1,
          widths: ['*', '*'],
          body: [
            [
              { text: 'שם מלא', style: 'tableHeader', alignment: 'right' },
              { text: 'תעודת זהות', style: 'tableHeader', alignment: 'right' }
            ],
            [
              { text: data.parentInfo.parentName || '', alignment: 'right' },
              { text: data.parentInfo.parentId || '', alignment: 'right' }
            ]
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 20]
      });
    }
    
    // Add declaration items section
    contentItems.push({ 
      text: 'תוכן ההצהרה', 
      style: 'subheader', 
      margin: [0, 10, 0, 10] 
    });
    
    // Get declaration items
    const declarationItems = getDeclarationItems();
    
    // Add declaration items as a table
    contentItems.push({
      table: {
        widths: ['auto', '*'],
        body: declarationItems.map(item => [
          { text: '•', alignment: 'right' }, 
          { text: item, alignment: 'right' }
        ])
      },
      layout: 'noBorders',
      margin: [10, 5, 0, 10]
    });
    
    // Add medical notes if available
    if (data.medicalNotes) {
      contentItems.push({ 
        text: 'הערות רפואיות', 
        style: 'subheader', 
        margin: [0, 20, 0, 10] 
      });
      
      contentItems.push({ 
        text: data.medicalNotes, 
        margin: [0, 0, 0, 20] 
      });
    }
    
    // Add confirmation
    contentItems.push({ 
      text: 'אישור', 
      style: 'subheader', 
      margin: [0, 20, 0, 10] 
    });
    
    contentItems.push({ 
      text: 'אני מאשר/ת כי קראתי והבנתי את האמור לעיל ואני מצהיר/ה כי כל הפרטים שמסרתי הם נכונים.', 
      margin: [0, 0, 0, 20] 
    });
    
    // Add signature line
    contentItems.push({ 
      text: 'חתימת ההורה/אפוטרופוס: ________________', 
      margin: [0, 30, 0, 0] 
    });
    
    // Define styles
    const styles: StyleDictionary = {
      header: { 
        fontSize: 18, 
        bold: true, 
        margin: [0, 0, 0, 10] 
      },
      subheader: { 
        fontSize: 14, 
        bold: true, 
        margin: [0, 10, 0, 5] 
      },
      tableHeader: { 
        bold: true, 
        fillColor: '#f5f5f5' 
      }
    };
    
    // Generate filename
    const fileName = `הצהרת_בריאות_${data.participant.fullName.replace(/\s+/g, '_')}.pdf`;
    
    return {
      content: contentItems,
      styles,
      fileName
    };
  } catch (error) {
    console.error('Error building health declaration PDF content:', error);
    throw new Error('אירעה שגיאה בבניית תוכן ה-PDF');
  }
};
