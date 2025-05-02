
import type { Registration, Participant, Payment } from '@/types';
import { formatCurrency } from '@/utils/formatters';
import { format } from 'date-fns';
import type { Content, StyleDictionary } from 'pdfmake/interfaces';

interface PdfContentResult {
  content: Content[];
  styles: StyleDictionary;
  fileName: string;
}

/**
 * Builds the content for a registration PDF
 */
export const buildRegistrationContent = (
  registration: Registration,
  participant: Participant,
  payments: Payment[]
): PdfContentResult => {
  try {
    console.log("Building registration PDF content...");
    
    // Format current date for display
    const currentDate = format(new Date(), 'dd/MM/yyyy');
    
    // Create a filename
    const fileName = `registration_${participant.firstName}_${participant.lastName}_${registration.id.substring(0, 8)}.pdf`;
    
    // Prepare the content array
    const contentItems: Content[] = [];
    
    // Add title
    contentItems.push({ 
      text: 'אישור רישום', 
      style: 'header', 
      alignment: 'center' 
    });
    
    // Add date
    contentItems.push({ 
      text: `תאריך: ${currentDate}`, 
      alignment: 'left', 
      margin: [0, 0, 0, 20] 
    });
    
    // Add participant section
    contentItems.push({ 
      text: 'פרטי משתתף', 
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
            { text: `${participant.firstName} ${participant.lastName}`, alignment: 'right' },
            { text: participant.idNumber, alignment: 'right' },
            { text: participant.phone, alignment: 'right' }
          ]
        ]
      },
      layout: 'lightHorizontalLines',
      margin: [0, 0, 0, 20]
    });
    
    // Registration information section
    contentItems.push({ 
      text: 'פרטי רישום', 
      style: 'subheader', 
      margin: [0, 10, 0, 10] 
    });
    
    // Calculate effective required amount (after discount)
    const discountAmount = registration.discountAmount || 0;
    const effectiveRequiredAmount = Math.max(0, registration.requiredAmount - (registration.discountApproved ? discountAmount : 0));
    
    const registrationData = [
      ['תאריך רישום', format(new Date(registration.registrationDate), 'dd/MM/yyyy')],
      ['סכום מקורי', formatCurrency(registration.requiredAmount)],
      ['הנחה', registration.discountApproved ? formatCurrency(discountAmount) : 'לא'],
      ['סכום לתשלום', formatCurrency(effectiveRequiredAmount)],
      ['סכום ששולם', formatCurrency(registration.paidAmount)],
    ];
    
    contentItems.push({
      table: {
        widths: ['auto', '*'],
        body: registrationData.map(row => [
          { text: row[0], alignment: 'right', bold: true },
          { text: row[1], alignment: 'right' }
        ])
      },
      layout: 'lightHorizontalLines',
      margin: [0, 0, 0, 20]
    });
    
    // Payment details section
    if (payments.length > 0) {
      contentItems.push({ 
        text: 'פרטי תשלומים', 
        style: 'subheader', 
        margin: [0, 10, 0, 10] 
      });
      
      const paymentTableBody = [
        [
          { text: 'תאריך תשלום', style: 'tableHeader', alignment: 'right' },
          { text: 'מספר קבלה', style: 'tableHeader', alignment: 'right' },
          { text: 'סכום', style: 'tableHeader', alignment: 'right' }
        ],
        ...payments.map(payment => [
          { text: format(new Date(payment.paymentDate), 'dd/MM/yyyy'), alignment: 'right' },
          { text: payment.receiptNumber, alignment: 'right' },
          { text: formatCurrency(payment.amount), alignment: 'right' }
        ])
      ];
      
      contentItems.push({
        table: {
          headerRows: 1,
          widths: ['*', '*', '*'],
          body: paymentTableBody
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 20]
      });
    }
    
    // Add footer
    contentItems.push({ 
      text: 'מסמך זה מהווה אישור רשמי על רישום ותשלום.', 
      alignment: 'center',
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
    
    return {
      content: contentItems,
      styles,
      fileName
    };
  } catch (error) {
    console.error('Error building registration PDF content:', error);
    throw new Error('אירעה שגיאה בבניית תוכן ה-PDF');
  }
};
