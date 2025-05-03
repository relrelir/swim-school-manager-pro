
import type { TDocumentDefinitions } from 'pdfmake/interfaces';

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
