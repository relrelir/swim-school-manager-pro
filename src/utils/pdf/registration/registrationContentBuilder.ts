
import { format } from 'date-fns';
import { formatCurrency } from '@/utils/formatters';
import type { Content, StyleDictionary } from 'pdfmake/interfaces';

// Types for the content builder
type RegistrationData = {
  registrationId: string;
  registrationDate: string;
  requiredAmount: number;
  discountAmount: number | null;
  discountApproved: boolean;
  paidAmount: number;
  productName: string;
};

type ParticipantData = {
  firstName: string;
  lastName: string;
  idNumber: string;
  phone: string;
};

type PaymentData = {
  paymentDate: string;
  receiptNumber: string | null;
  amount: number;
};

/**
 * Creates registration PDF content structure
 */
export const buildRegistrationContent = (
  registration: RegistrationData,
  participant: ParticipantData,
  payments: PaymentData[]
): { content: Content[]; styles: StyleDictionary; fileName: string } => {
  console.log("Building registration PDF content...");

  // Format current date for display
  const currentDate = format(new Date(), 'dd/MM/yyyy');
  
  // Create a filename
  const fileName = `registration_${participant.firstName}_${participant.lastName}_${registration.registrationId.substring(0, 8)}.pdf`;
  
  // Prepare content items array
  const contentItems: Content[] = [];
  
  // Title with product name
  contentItems.push({ 
    text: 'אישור רישום למוצר', 
    style: 'header', 
    alignment: 'center' 
  });
  
  contentItems.push({ 
    text: `מוצר: ${registration.productName}`, 
    style: 'productName', 
    alignment: 'center', 
    margin: [0, 0, 0, 20] 
  });
  
  contentItems.push({ 
    text: `תאריך: ${currentDate}`, 
    alignment: 'left', 
    margin: [0, 0, 0, 20] 
  });
  
  // Participant information
  contentItems.push({ 
    text: 'פרטי משתתף:', 
    style: 'subheader' 
  });
  
  // Create participant data table
  contentItems.push(createParticipantTable(participant));
  
  // Calculate effective required amount (after discount)
  const discountAmount = registration.discountAmount || 0;
  const effectiveRequiredAmount = Math.max(0, registration.requiredAmount - (registration.discountApproved ? discountAmount : 0));
  
  // Registration information
  contentItems.push({ 
    text: 'פרטי רישום:', 
    style: 'subheader', 
    margin: [0, 20, 0, 10] 
  });
  
  contentItems.push(createRegistrationTable(
    registration,
    effectiveRequiredAmount,
    discountAmount
  ));
  
  // Payment details if any exist
  if (payments && payments.length > 0) {
    contentItems.push({ 
      text: 'פרטי תשלומים:', 
      style: 'subheader', 
      margin: [0, 20, 0, 10] 
    });
    
    contentItems.push(createPaymentsTable(payments));
  }
  
  // Footer
  contentItems.push({ 
    text: 'מסמך זה מהווה אישור רשמי על רישום ותשלום.', 
    style: 'footer', 
    alignment: 'center', 
    margin: [0, 30, 0, 0] 
  });

  // Create PDF style definitions
  const styles: StyleDictionary = {
    header: { 
      fontSize: 18, 
      bold: true, 
      margin: [0, 0, 0, 10] 
    },
    productName: { 
      fontSize: 16, 
      bold: true 
    },
    subheader: { 
      fontSize: 14, 
      bold: true, 
      margin: [0, 10, 0, 10] 
    },
    tableHeader: { 
      bold: true, 
      fillColor: '#f5f5f5' 
    },
    footer: { 
      fontSize: 10, 
      italics: true 
    }
  };
  
  return {
    content: contentItems,
    styles,
    fileName
  };
};

/**
 * Creates the participant information table
 */
const createParticipantTable = (participant: ParticipantData) => {
  return {
    table: {
      headerRows: 1,
      widths: ['*', '*', '*'],
      body: [
        [
          { text: 'שם מלא:', style: 'tableHeader', alignment: 'right' },
          { text: 'תעודת זהות:', style: 'tableHeader', alignment: 'right' },
          { text: 'טלפון:', style: 'tableHeader', alignment: 'right' }
        ],
        [
          { text: `${participant.firstName} ${participant.lastName}`, alignment: 'right' },
          { text: participant.idNumber, alignment: 'right' },
          { text: participant.phone, alignment: 'right' }
        ]
      ]
    },
    layout: {
      hLineWidth: (i: number, node: any) => (i === 0 || i === node.table.body.length) ? 1 : 1,
      vLineWidth: () => 1,
      hLineColor: () => '#CCCCCC',
      vLineColor: () => '#CCCCCC',
    }
  };
};

/**
 * Creates the registration information table
 */
const createRegistrationTable = (
  registration: RegistrationData,
  effectiveRequiredAmount: number,
  discountAmount: number
) => {
  return {
    table: {
      headerRows: 1,
      widths: ['*', '*'],
      body: [
        [
          { text: 'תאריך רישום:', style: 'tableHeader', alignment: 'right' },
          { text: registration.registrationDate, alignment: 'right' }
        ],
        [
          { text: 'סכום מקורי:', style: 'tableHeader', alignment: 'right' },
          { text: formatCurrency(registration.requiredAmount), alignment: 'right' }
        ],
        [
          { text: 'הנחה:', style: 'tableHeader', alignment: 'right' },
          { text: registration.discountApproved ? formatCurrency(discountAmount) : 'לא', alignment: 'right' }
        ],
        [
          { text: 'סכום לתשלום:', style: 'tableHeader', alignment: 'right' },
          { text: formatCurrency(effectiveRequiredAmount), alignment: 'right' }
        ],
        [
          { text: 'סכום ששולם:', style: 'tableHeader', alignment: 'right' },
          { text: formatCurrency(registration.paidAmount), alignment: 'right' }
        ]
      ]
    },
    layout: {
      hLineWidth: (i: number, node: any) => (i === 0 || i === node.table.body.length) ? 1 : 1,
      vLineWidth: () => 1,
      hLineColor: () => '#CCCCCC',
      vLineColor: () => '#CCCCCC',
    }
  };
};

/**
 * Creates the payments table
 */
const createPaymentsTable = (payments: PaymentData[]) => {
  return {
    table: {
      headerRows: 1,
      widths: ['*', '*', '*'],
      body: [
        [
          { text: 'תאריך תשלום', style: 'tableHeader', alignment: 'right' },
          { text: 'מספר קבלה', style: 'tableHeader', alignment: 'right' },
          { text: 'סכום', style: 'tableHeader', alignment: 'right' }
        ],
        ...payments.map(payment => [
          { text: payment.paymentDate, alignment: 'right' },
          { text: payment.receiptNumber || '-', alignment: 'right' },
          { text: formatCurrency(payment.amount), alignment: 'right' }
        ])
      ]
    },
    layout: {
      hLineWidth: (i: number, node: any) => (i === 0 || i === node.table.body.length) ? 1 : 1,
      vLineWidth: () => 1,
      hLineColor: () => '#CCCCCC',
      vLineColor: () => '#CCCCCC',
    }
  };
};
