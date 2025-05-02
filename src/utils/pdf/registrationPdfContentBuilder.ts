
import { jsPDF } from 'jspdf';
import { Registration, Participant, Payment } from '@/types';
import { formatCurrency } from '@/utils/formatters';
import { format } from 'date-fns';
import { addPdfTitle, addPdfDate, addSectionTitle, createDataTable, createPlainTextTable } from './pdfHelpers';

/**
 * Builds a registration PDF with participant and payment information
 */
export function buildRegistrationPDF(
  pdf: jsPDF,
  registration: Registration,
  participant: Participant,
  payments: Payment[],
  productName: string
): string {
  try {
    console.log("Building registration PDF...");
    
    // Format current date for display
    const currentDate = format(new Date(), 'dd/MM/yyyy');
    
    // Create a filename
    const fileName = `registration_${participant.firstName}_${participant.lastName}_${registration.id.substring(0, 8)}.pdf`;
    
    // Add PDF title
    addPdfTitle(pdf, 'אישור רישום למוצר');
    console.log("Title added to PDF");
    
    // Add date to document
    addPdfDate(pdf, currentDate);
    
    // Add product name
    pdf.setFontSize(16);
    pdf.text(`מוצר: ${productName}`, pdf.internal.pageSize.width / 2, 35, { align: 'center' });
    
    // Participant information section
    addSectionTitle(pdf, 'פרטי משתתף:', 50);
    
    // Create participant data
    const participantData = [
      ['שם מלא:', `${participant.firstName} ${participant.lastName}`],
      ['תעודת זהות:', participant.idNumber],
      ['טלפון:', participant.phone],
    ];
    
    // Create table with participant data
    let yPosition = createDataTable(pdf, participantData, 55);
    console.log("Added participant data");
    
    // Registration information
    addSectionTitle(pdf, 'פרטי רישום:', yPosition + 15);
    
    // Calculate effective required amount (after discount)
    const discountAmount = registration.discountAmount || 0;
    const effectiveRequiredAmount = Math.max(0, registration.requiredAmount - (registration.discountApproved ? discountAmount : 0));
    
    const registrationData = [
      ['תאריך רישום:', format(new Date(registration.registrationDate), 'dd/MM/yyyy')],
      ['סכום מקורי:', formatCurrency(registration.requiredAmount)],
      ['הנחה:', registration.discountApproved ? formatCurrency(discountAmount) : 'לא'],
      ['סכום לתשלום:', formatCurrency(effectiveRequiredAmount)],
      ['סכום ששולם:', formatCurrency(registration.paidAmount)],
    ];
    
    // Create table with registration data
    yPosition = createDataTable(pdf, registrationData, yPosition + 20);
    console.log("Added registration data");
    
    // Payment details section
    if (payments.length > 0) {
      addSectionTitle(pdf, 'פרטי תשלומים:', yPosition + 15);
      
      // Create payment details table header
      const paymentHeaders = [[
        'תאריך תשלום', 
        'מספר קבלה', 
        'סכום'
      ]];
      
      // Create payment details rows
      const paymentData = payments.map(payment => [
        format(new Date(payment.paymentDate), 'dd/MM/yyyy'),
        payment.receiptNumber,
        formatCurrency(payment.amount)
      ]);
      
      // Create table with payment data and headers
      yPosition = createDataTable(pdf, [...paymentHeaders, ...paymentData], yPosition + 20, true);
      console.log("Added payments data");
    }
    
    // Add footer
    const footerText = 'מסמך זה מהווה אישור רשמי על רישום ותשלום.';
    pdf.setFontSize(10);
    pdf.text(footerText, pdf.internal.pageSize.width / 2, pdf.internal.pageSize.height - 20, { align: 'center' });
    console.log("Added footer");
    
    return fileName;
  } catch (error) {
    console.error('Error in buildRegistrationPDF:', error);
    throw error;
  }
}
