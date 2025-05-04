
import jsPDF from 'jspdf';
import { Payment, Registration, Participant } from '@/types';

// Load Alef font for Hebrew support
// Base64 font definition will be added here
const ALEF_FONT_NORMAL = '';  // We need to add the base64 encoded font data

export const initFont = (doc: jsPDF) => {
  // Add font to the PDF document
  doc.addFileToVFS('Alef-Regular.ttf', ALEF_FONT_NORMAL);
  doc.addFont('Alef-Regular.ttf', 'Alef', 'normal');
  doc.setFont('Alef');
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(amount);
};

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('he-IL');
};

export const generatePaymentReceipt = (
  payment: Payment,
  registration: Registration,
  participant: Participant
): jsPDF => {
  // Create a new PDF document (RTL for Hebrew)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Initialize font
  initFont(doc);
  doc.setFontSize(12);

  // Set RTL mode for Hebrew text
  doc.setR2L(true);

  // Add header
  doc.setFontSize(20);
  doc.text('קבלה', 150, 20);
  
  doc.setFontSize(12);
  doc.text(`מספר קבלה: ${payment.receiptNumber}`, 150, 30);
  doc.text(`תאריך: ${formatDate(payment.paymentDate)}`, 150, 40);

  // Add participant details
  doc.text('פרטי המשתתף:', 150, 55);
  doc.text(`שם: ${participant.firstName} ${participant.lastName}`, 150, 65);
  doc.text(`ת.ז: ${participant.idNumber}`, 150, 75);
  doc.text(`טלפון: ${participant.phone}`, 150, 85);

  // Add payment details
  doc.text('פרטי התשלום:', 150, 100);
  doc.text(`סכום: ${formatCurrency(payment.amount)}`, 150, 110);
  doc.text(`שיטת תשלום: העברה בנקאית`, 150, 120);
  
  // Add product info if available
  if (registration) {
    doc.text(`עבור: ${registration.productId}`, 150, 130);
    doc.text(`מחיר מקורי: ${formatCurrency(registration.requiredAmount)}`, 150, 140);
    
    if (registration.discountApproved && registration.discountAmount) {
      doc.text(`הנחה: ${formatCurrency(registration.discountAmount)}`, 150, 150);
      const effectiveAmount = registration.requiredAmount - registration.discountAmount;
      doc.text(`סכום לתשלום: ${formatCurrency(effectiveAmount)}`, 150, 160);
    }
  }

  // Add signature line
  doc.text('חתימה: _________________', 150, 200);

  return doc;
};

export const generatePaymentReport = (
  registrations: Registration[],
  getParticipantForRegistration: (registration: Registration) => Participant | undefined,
  getPaymentsForRegistration: (registration: Registration) => Payment[],
  productName: string = 'פעילות'
): jsPDF => {
  // Create a new PDF document (RTL for Hebrew)
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  // Initialize font
  initFont(doc);
  doc.setFontSize(12);

  // Set RTL mode for Hebrew text
  doc.setR2L(true);

  // Add title
  const title = `דוח תשלומים - ${productName}`;
  doc.setFontSize(18);
  doc.text(title, 200, 20);
  
  // Add date
  doc.setFontSize(12);
  const today = new Date().toLocaleDateString('he-IL');
  doc.text(`תאריך הפקה: ${today}`, 200, 30);

  // Table headers
  const startY = 40;
  const lineHeight = 10;
  let currentY = startY;

  // Draw table headers
  doc.setFont('Alef', 'bold');
  doc.text('שם משתתף', 240, currentY);
  doc.text('ת.ז', 200, currentY);
  doc.text('מחיר מקורי', 160, currentY);
  doc.text('הנחה', 130, currentY);
  doc.text('סכום לתשלום', 90, currentY);
  doc.text('שולם', 60, currentY);
  doc.text('מספרי קבלות', 20, currentY);
  
  doc.setLineWidth(0.5);
  currentY += 2;
  doc.line(10, currentY, 285, currentY);
  currentY += 5;

  // Reset font to normal
  doc.setFont('Alef', 'normal');
  
  // Add data rows
  registrations.forEach((registration) => {
    const participant = getParticipantForRegistration(registration);
    if (!participant) return;
    
    const payments = getPaymentsForRegistration(registration);
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    const discountAmount = registration.discountApproved ? (registration.discountAmount || 0) : 0;
    const effectiveAmount = registration.requiredAmount - discountAmount;
    const receiptNumbers = payments.map(p => p.receiptNumber).filter(r => r).join(', ');
    
    // Check if we need a new page
    if (currentY > 190) {
      doc.addPage();
      currentY = 20;
      
      // Add headers on the new page
      doc.setFont('Alef', 'bold');
      doc.text('שם משתתף', 240, currentY);
      doc.text('ת.ז', 200, currentY);
      doc.text('מחיר מקורי', 160, currentY);
      doc.text('הנחה', 130, currentY);
      doc.text('סכום לתשלום', 90, currentY);
      doc.text('שולם', 60, currentY);
      doc.text('מספרי קבלות', 20, currentY);
      
      doc.setLineWidth(0.5);
      currentY += 2;
      doc.line(10, currentY, 285, currentY);
      currentY += 5;
      doc.setFont('Alef', 'normal');
    }
    
    // Add row data
    doc.text(`${participant.firstName} ${participant.lastName}`, 240, currentY);
    doc.text(participant.idNumber, 200, currentY);
    doc.text(formatCurrency(registration.requiredAmount), 160, currentY);
    doc.text(formatCurrency(discountAmount), 130, currentY);
    doc.text(formatCurrency(effectiveAmount), 90, currentY);
    doc.text(formatCurrency(totalPaid), 60, currentY);
    doc.text(receiptNumbers || '-', 20, currentY);
    
    currentY += lineHeight;
  });
  
  // Add summary at the end
  currentY += 10;
  doc.setFont('Alef', 'bold');
  doc.text('סיכום:', 240, currentY);
  
  currentY += lineHeight;
  const totalRequired = registrations.reduce((sum, r) => sum + r.requiredAmount, 0);
  const totalDiscounts = registrations.reduce((sum, r) => 
    sum + (r.discountApproved ? (r.discountAmount || 0) : 0), 0);
  const totalEffective = totalRequired - totalDiscounts;
  const totalPaid = registrations.reduce((sum, r) => {
    const payments = getPaymentsForRegistration(r);
    return sum + payments.reduce((pSum, p) => pSum + p.amount, 0);
  }, 0);
  
  doc.text(`סה"כ מחיר מקורי: ${formatCurrency(totalRequired)}`, 240, currentY);
  currentY += lineHeight;
  doc.text(`סה"כ הנחות: ${formatCurrency(totalDiscounts)}`, 240, currentY);
  currentY += lineHeight;
  doc.text(`סה"כ לתשלום: ${formatCurrency(totalEffective)}`, 240, currentY);
  currentY += lineHeight;
  doc.text(`סה"כ שולם: ${formatCurrency(totalPaid)}`, 240, currentY);
  
  return doc;
};

// Function to save the PDF
export const downloadPDF = (doc: jsPDF, filename: string): void => {
  doc.save(filename);
};
