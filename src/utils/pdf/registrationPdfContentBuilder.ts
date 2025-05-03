
import { jsPDF } from 'jspdf';
import { Registration, Participant, Payment } from '@/types';
import { formatCurrency } from '@/utils/formatters';
import { format } from 'date-fns';
import { addPdfTitle, addPdfDate, addSectionTitle, createDataTable, createPlainTextTable } from './pdfHelpers';
import { processTextDirection, forceLtrDirection } from './hebrewTextHelper';

/**
 * Builds a registration PDF with participant and payment information
 * Enhanced with improved bidirectional text handling
 */
export function buildRegistrationPDF(
  pdf: jsPDF,
  registration: Registration,
  participant: Participant,
  payments: Payment[],
  productName: string
): string {
  try {
    console.log("Building registration PDF with enhanced bidirectional text support...");
    
    // Format current date for display - use explicit format with day first
    // Apply strongest possible LTR control for date display
    const currentDate = forceLtrDirection(format(new Date(), 'dd/MM/yyyy'));
    
    // Create a filename
    const fileName = `registration_${participant.firstName}_${participant.lastName}_${registration.id.substring(0, 8)}.pdf`;
    
    // Add PDF title
    addPdfTitle(pdf, 'אישור רישום למוצר');
    console.log("Title added to PDF");
    
    // Add date to document with explicit LTR control
    addPdfDate(pdf, currentDate);
    
    // Add product name - Hebrew content gets RTL
    pdf.setR2L(true); // Enable RTL just for this section
    pdf.setFontSize(16);
    pdf.text(`מוצר: ${productName}`, pdf.internal.pageSize.width / 2, 35, { align: 'center' });
    pdf.setR2L(false); // Disable RTL for next operations
    
    // Participant information section
    addSectionTitle(pdf, 'פרטי משתתף:', 50);
    
    // Process participant data with explicit content type direction control
    // For Hebrew names, use basic processing
    const fullName = `${participant.firstName} ${participant.lastName}`;
    
    // For IDs and phone numbers, use strongest possible LTR control
    const idNumber = forceLtrDirection(participant.idNumber);
    const phone = forceLtrDirection(participant.phone);
    
    // Create participant data - now with explicit label/value direction handling
    // Hebrew labels and text (value, label)
    const participantData = [
      [fullName, 'שם מלא:'],
      [idNumber, 'תעודת זהות:'],
      [phone, 'טלפון:'],
    ];
    
    // Create table with participant data
    let yPosition = createDataTable(pdf, participantData, 55);
    console.log("Added participant data");
    
    // Registration information
    addSectionTitle(pdf, 'פרטי רישום:', yPosition + 15);
    
    // Calculate effective required amount (after discount)
    const discountAmount = registration.discountAmount || 0;
    const effectiveRequiredAmount = Math.max(0, registration.requiredAmount - (registration.discountApproved ? discountAmount : 0));
    
    // Format the registration date with day first and explicit LTR control
    const formattedRegistrationDate = forceLtrDirection(format(new Date(registration.registrationDate), 'dd/MM/yyyy'));
    
    // Instead of pre-formatting currency values, pass the numeric values directly to createDataTable
    // The table formatter will handle the currency formatting with proper direction
    const registrationData = [
      [formattedRegistrationDate, 'תאריך רישום:'],
      [registration.requiredAmount, 'סכום מקורי:'],
      [registration.discountApproved ? discountAmount : 'לא', 'הנחה:'],
      [effectiveRequiredAmount, 'סכום לתשלום:'],
      [registration.paidAmount, 'סכום ששולם:'],
    ];
    
    // Create table with registration data
    yPosition = createDataTable(pdf, registrationData, yPosition + 20);
    console.log("Added registration data");
    
    // Payment details section
    if (payments.length > 0) {
      addSectionTitle(pdf, 'פרטי תשלומים:', yPosition + 15);
      
      // Create payment details table header
      const paymentHeaders = [
        'סכום',
        'מספר קבלה', 
        'תאריך תשלום'
      ];
      
      // Create payment details rows with enhanced direction control
      // Pass numeric values directly for amounts
      const paymentData = payments.map(payment => [
        payment.amount, // Pass the numeric value - the table cell processor will format it
        forceLtrDirection(payment.receiptNumber),
        forceLtrDirection(format(new Date(payment.paymentDate), 'dd/MM/yyyy'))
      ]);
      
      // Create table with payment data and headers - reversed for RTL display
      yPosition = createDataTable(pdf, [[...paymentHeaders].reverse(), ...paymentData.map(row => [...row].reverse())], yPosition + 20, true);
      console.log("Added payments data");
    }
    
    // Add footer
    pdf.setR2L(true); // Enable RTL for Hebrew footer text
    const footerText = 'מסמך זה מהווה אישור רשמי על רישום ותשלום.';
    pdf.setFontSize(10);
    pdf.text(footerText, pdf.internal.pageSize.width / 2, pdf.internal.pageSize.height - 20, { align: 'center' });
    pdf.setR2L(false); // Reset RTL setting
    console.log("Added footer");
    
    return fileName;
  } catch (error) {
    console.error('Error in buildRegistrationPDF:', error);
    throw error;
  }
}

