
import { jsPDF } from 'jspdf';
import { Registration, Participant, Payment } from '@/types';
import { formatCurrency } from '@/utils/formatters';
import { format } from 'date-fns';
import { addPdfTitle, addPdfDate, addSectionTitle, createDataTable, createPlainTextTable } from './pdfHelpers';
import { processTextDirection } from './hebrewTextHelper';

/**
 * Builds a registration PDF with participant and payment information
 * With improved text direction handling for mixed content
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
    
    // Format current date for display - use explicit format with day first
    const currentDate = processTextDirection(format(new Date(), 'dd/MM/yyyy'));
    
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
    
    // Create participant data - swap column order for correct RTL display
    // Value first, then label (opposite of what's visually expected for RTL)
    // Process text for correct direction handling of mixed content
    const participantData = [
      [processTextDirection(`${participant.firstName} ${participant.lastName}`), 'שם מלא:'],
      [processTextDirection(participant.idNumber), 'תעודת זהות:'],
      [processTextDirection(participant.phone), 'טלפון:'],
    ];
    
    // Create table with participant data
    let yPosition = createDataTable(pdf, participantData, 55);
    console.log("Added participant data");
    
    // Registration information
    addSectionTitle(pdf, 'פרטי רישום:', yPosition + 15);
    
    // Calculate effective required amount (after discount)
    const discountAmount = registration.discountAmount || 0;
    const effectiveRequiredAmount = Math.max(0, registration.requiredAmount - (registration.discountApproved ? discountAmount : 0));
    
    // Explicitly format the registration date with day first
    // Apply direction handling for the date
    const formattedRegistrationDate = processTextDirection(format(new Date(registration.registrationDate), 'dd/MM/yyyy'));
    
    // Registration data - swap column order for correct RTL display
    // Value first, then label (opposite of what's visually expected for RTL)
    const registrationData = [
      [formattedRegistrationDate, 'תאריך רישום:'],
      [formatCurrency(registration.requiredAmount), 'סכום מקורי:'],
      [registration.discountApproved ? formatCurrency(discountAmount) : 'לא', 'הנחה:'],
      [formatCurrency(effectiveRequiredAmount), 'סכום לתשלום:'],
      [formatCurrency(registration.paidAmount), 'סכום ששולם:'],
    ];
    
    // Create table with registration data
    yPosition = createDataTable(pdf, registrationData, yPosition + 20);
    console.log("Added registration data");
    
    // Payment details section
    if (payments.length > 0) {
      addSectionTitle(pdf, 'פרטי תשלומים:', yPosition + 15);
      
      // Create payment details table header - also swap for RTL
      const paymentHeaders = [[
        'סכום',
        'מספר קבלה', 
        'תאריך תשלום'
      ]];
      
      // Create payment details rows - swap order and ensure correct date format
      // Apply direction handling for the date and receipt number
      const paymentData = payments.map(payment => [
        formatCurrency(payment.amount),
        processTextDirection(payment.receiptNumber),
        processTextDirection(format(new Date(payment.paymentDate), 'dd/MM/yyyy'))
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
