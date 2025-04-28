
import { RegistrationWithDetails } from '@/types';

// Function to convert data to CSV
export const convertToCSV = (data: any[], columns: { key: string, header: string }[]) => {
  // Create header row
  const headerRow = columns.map(col => col.header).join(',');
  
  // Create data rows
  const dataRows = data.map(item => {
    return columns.map(col => {
      // Handle nested properties
      const path = col.key.split('.');
      let value = item;
      for (const key of path) {
        if (value === null || value === undefined) return '';
        value = value[key];
      }
      
      // Format value (handle strings with commas)
      if (typeof value === 'string' && value.includes(',')) {
        return `"${value}"`;
      }
      return value !== undefined && value !== null ? value : '';
    }).join(',');
  }).join('\n');
  
  // Combine header and data
  return `${headerRow}\n${dataRows}`;
};

// Function to create and download a CSV file
export const downloadCSV = (data: any[], columns: { key: string, header: string }[], filename: string) => {
  const csv = convertToCSV(data, columns);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  // Create download link
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  // Trigger download
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Function to export all registrations to CSV
export const exportRegistrationsToCSV = (registrations: RegistrationWithDetails[], filename: string = 'registrations.csv') => {
  const columns = [
    { key: 'participant.firstName', header: 'שם פרטי' },
    { key: 'participant.lastName', header: 'שם משפחה' },
    { key: 'participant.idNumber', header: 'תעודת זהות' },
    { key: 'participant.phone', header: 'טלפון' },
    { key: 'season.name', header: 'עונה' },
    { key: 'product.name', header: 'מוצר' },
    { key: 'product.type', header: 'סוג מוצר' },
    { key: 'requiredAmount', header: 'סכום לתשלום' },
    { key: 'paidAmount', header: 'סכום ששולם' },
    { key: 'receiptNumber', header: 'מספר קבלה' },
    { key: 'paymentStatus', header: 'סטטוס תשלום' },
    { key: 'discountApproved', header: 'הנחה אושרה' },
  ];
  
  downloadCSV(registrations, columns, filename);
};
