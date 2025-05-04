
import jsPDF from 'jspdf';
import { Payment, Registration, Participant, HealthDeclaration } from '@/types';

// Load Alef font for Hebrew support
// Base64 encoded font data for Hebrew support
const ALEF_FONT_NORMAL = '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';

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

// New function to generate health declaration PDF
export const generateHealthDeclarationPDF = (
  healthDeclaration: HealthDeclaration,
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
  doc.text('הצהרת בריאות', 150, 20);
  
  doc.setFontSize(12);
  const today = new Date().toLocaleDateString('he-IL');
  doc.text(`תאריך הפקה: ${today}`, 150, 30);

  // Add participant details
  doc.text('פרטי המשתתף:', 150, 45);
  doc.text(`שם: ${participant.firstName} ${participant.lastName}`, 150, 55);
  doc.text(`ת.ז: ${participant.idNumber}`, 150, 65);
  doc.text(`טלפון: ${participant.phone}`, 150, 75);

  // Add health declaration content
  doc.text('תוכן הצהרת הבריאות:', 150, 95);
  
  // Declaration text - main content
  const declarationText = [
    'אני מצהיר/ה בזאת כי:',
    '• בני/בתי נמצא/ת בכושר ובמצב בריאותי תקין המאפשר השתתפות בפעילות.',
    '• לא ידוע לי על מגבלות רפואיות המונעות מבני/בתי להשתתף בפעילות.',
    '• לא ידוע לי על רגישויות, מחלות או בעיות רפואיות אחרות שעלולות להשפיע על השתתפותו/ה בפעילות.',
    '• אני מתחייב/ת להודיע למדריכים על כל שינוי במצב הבריאותי של בני/בתי.'
  ];

  // Add declaration text
  let yPos = 105;
  declarationText.forEach((line) => {
    doc.text(line, 150, yPos);
    yPos += 10;
  });

  // Add status information
  yPos += 10;
  doc.text('סטטוס הצהרה:', 150, yPos);
  yPos += 10;
  
  if (healthDeclaration.formStatus === 'signed') {
    doc.text(`✓ הצהרה חתומה בתאריך: ${healthDeclaration.signedAt ? formatDate(healthDeclaration.signedAt) : 'לא צוין'}`, 150, yPos);
  } else {
    doc.text(`○ הצהרה לא חתומה`, 150, yPos);
    if (healthDeclaration.sentAt) {
      yPos += 10;
      doc.text(`נשלחה בתאריך: ${formatDate(healthDeclaration.sentAt)}`, 150, yPos);
    }
  }

  // Add notes if available
  if (healthDeclaration.notes) {
    yPos += 15;
    doc.text('הערות:', 150, yPos);
    yPos += 10;
    
    const notesLines = doc.splitTextToSize(healthDeclaration.notes, 120);
    notesLines.forEach((line: string) => {
      doc.text(line, 150, yPos);
      yPos += 8;
    });
  }

  // Add signature line
  doc.text('חתימת הורה/אפוטרופוס: _________________', 150, 250);
  doc.text('תאריך: _________________', 150, 260);

  return doc;
};

// Function to save the PDF
export const downloadPDF = (doc: jsPDF, filename: string): void => {
  doc.save(filename);
};
