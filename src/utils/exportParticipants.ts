
import { Registration, Participant, Payment, PaymentStatus } from '@/types';
import { format } from 'date-fns';

// Helper function to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(amount);
};

export interface ParticipantExportData {
  fullName: string;
  idNumber: string;
  phone: string;
  requiredAmount: string;
  effectiveAmount: string;
  paidAmount: string;
  receiptNumbers: string;
  discountAmount: string;
  discountApplied: string;
  healthApproval: string;
  paymentStatus: PaymentStatus;
  registrationDate: string;
}

export function prepareParticipantsData(
  registrations: Registration[],
  getParticipantForRegistration: (registration: Registration) => Participant | undefined,
  getPaymentsForRegistration: (registration: Registration) => Payment[],
  calculatePaymentStatus: (registration: Registration) => PaymentStatus
): ParticipantExportData[] {
  return registrations
    .map((registration) => {
      const participant = getParticipantForRegistration(registration);
      if (!participant) return null;

      const payments = getPaymentsForRegistration(registration);
      const receiptNumbers = payments
        .filter(p => p.receiptNumber)
        .map(p => p.receiptNumber)
        .join(', ');
      
      // Calculate effective required amount after discount
      const discountAmount = registration.discountAmount || 0;
      const effectiveRequiredAmount = Math.max(0, registration.requiredAmount - (registration.discountApproved ? discountAmount : 0));
      
      // Calculate actual paid amount from payments collection
      const actualPaidAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
      
      const paymentStatus = calculatePaymentStatus(registration);
      
      const registrationDate = registration.registrationDate 
        ? format(new Date(registration.registrationDate), 'dd/MM/yyyy') 
        : '';

      return {
        fullName: `${participant.firstName} ${participant.lastName}`,
        idNumber: participant.idNumber,
        phone: participant.phone,
        requiredAmount: formatCurrency(registration.requiredAmount),
        effectiveAmount: formatCurrency(effectiveRequiredAmount),
        paidAmount: formatCurrency(actualPaidAmount),
        receiptNumbers,
        discountAmount: formatCurrency(registration.discountApproved ? discountAmount : 0),
        discountApplied: registration.discountApproved ? 'כן' : 'לא',
        healthApproval: participant.healthApproval ? 'כן' : 'לא',
        paymentStatus,
        registrationDate,
      };
    })
    .filter((item): item is ParticipantExportData => item !== null);
}

export function exportToCSV(data: ParticipantExportData[], filename: string) {
  // Define headers
  const headers = {
    fullName: 'שם מלא',
    idNumber: 'ת.ז',
    phone: 'טלפון',
    requiredAmount: 'סכום מקורי',
    effectiveAmount: 'סכום לתשלום (אחרי הנחות)',
    paidAmount: 'סכום ששולם',
    discountAmount: 'סכום הנחה',
    receiptNumbers: 'מספרי קבלות',
    discountApplied: 'הנחה',
    healthApproval: 'אישור בריאות',
    paymentStatus: 'סטטוס תשלום',
    registrationDate: 'תאריך רישום',
  };
  
  // Create CSV header row
  const headerRow = Object.values(headers).join(',');
  
  // Create CSV rows from data
  const csvRows = data.map(row => {
    return Object.keys(headers)
      .map(key => {
        // Escape fields that contain commas or quotes
        const value = row[key as keyof ParticipantExportData].toString();
        const escaped = value.includes(',') || value.includes('"') 
          ? `"${value.replace(/"/g, '""')}"` 
          : value;
        return escaped;
      })
      .join(',');
  });
  
  // Combine header and data rows
  const csvContent = [headerRow, ...csvRows].join('\n');
  
  // Create a Blob with UTF-8 BOM for correct Hebrew display
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // Create download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  
  // Trigger download
  link.click();
  
  // Clean up
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
