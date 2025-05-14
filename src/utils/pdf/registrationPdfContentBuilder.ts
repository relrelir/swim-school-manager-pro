
import { jsPDF } from 'jspdf';
import { Registration, Participant, Payment } from '@/types';
import { formatCurrency } from '@/utils/formatters';
import { format } from 'date-fns';
import { addPdfTitle, addPdfDate, addSectionTitle, createDataTable, createPlainTextTable, addPdfLogo } from './pdfHelpers';
import { processTextDirection, forceLtrDirection } from './helpers/textDirection';

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
    
    // Add the logo at the top right corner
    addPdfLogo(pdf);
    
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
    
    // Registration information - MODIFIED as per requirements
    addSectionTitle(pdf, 'פרטי רישום:', yPosition + 15);
    
    // Calculate effective required amount (after discount)
    const discountAmount = registration.discountAmount || 0;
    const effectiveRequiredAmount = Math.max(0, registration.requiredAmount - (registration.discountApproved ? discountAmount : 0));
    
    // UPDATED: Calculate payment status text taking into account discounts
    let paymentStatusText;
    if (registration.discountApproved) {
      // For cases with approved discount
      if (registration.paidAmount >= effectiveRequiredAmount) {
        paymentStatusText = 'שולם במלואו';
      } else {
        paymentStatusText = 'תשלום חלקי';
      }
    } else {
      // Regular calculation without discount
      if (registration.paidAmount >= registration.requiredAmount) {
        paymentStatusText = 'שולם במלואו';
      } else if (registration.paidAmount > 0) {
        paymentStatusText = 'תשלום חלקי';
      } else {
        paymentStatusText = 'טרם שולם';
      }
    }
    
    // Format the registration date with day first and explicit LTR control
    const formattedRegistrationDate = forceLtrDirection(format(new Date(registration.registrationDate), 'dd/MM/yyyy'));
    
    // Modified registration data table with only the requested fields
    const registrationData = [
      [formattedRegistrationDate, 'תאריך רישום:'],
      [productName, 'מוצר:'],
      [formatCurrency(effectiveRequiredAmount), 'סכום לתשלום:'],
      [participant.healthApproval ? 'כן' : 'לא', 'הצהרת בריאות:'],
      [paymentStatusText, 'סטטוס תשלום:'],
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
      // Apply strongest LTR control for all numeric/receipt data
      const paymentData = payments.map(payment => [
        formatCurrency(payment.amount),
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
