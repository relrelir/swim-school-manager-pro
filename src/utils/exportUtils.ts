
import { RegistrationWithDetails, PaymentDetails } from '@/types';

// Function to convert data to CSV with UTF-8 BOM support for Hebrew
export const convertToCSV = (data: any[], columns: { key: string, header: string }[]) => {
  // Add UTF-8 BOM for proper Hebrew support
  const bom = '\uFEFF';
  
  // Create header row
  const headerRow = columns.map(col => `"${col.header}"`).join(',');
  
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
      if (typeof value === 'string') {
        // Always wrap in quotes for consistent Hebrew display
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value !== undefined && value !== null ? `"${value}"` : '""';
    }).join(',');
  }).join('\n');
  
  // Combine BOM, header and data
  return `${bom}${headerRow}\n${dataRows}`;
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
  // Process registration data to combine payment information
  const processedRegistrations = registrations.map(reg => {
    // If reg.payments exists, process them
    const payments = reg.payments || [];
    const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const receiptNumbers = payments.map(payment => payment.receiptNumber).join(', ');
    
    return {
      ...reg,
      paidAmount: totalPaid,
      receiptNumbers: receiptNumbers
    };
  });
  
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
    { key: 'receiptNumbers', header: 'מספרי קבלות' },
    { key: 'paymentStatus', header: 'סטטוס תשלום' },
    { key: 'discountApproved', header: 'הנחה אושרה' },
  ];
  
  downloadCSV(processedRegistrations, columns, filename);
};

// Function to export daily activities to CSV
export const exportDailyActivitiesToCSV = (activities: any[], filename: string = 'daily-activities.csv') => {
  // Process activities to include the correct day of week and meeting number info
  const processedActivities = activities.map(activity => {
    // The meeting info is already calculated in the UI
    const currentMeeting = activity.currentMeeting || '';
    const totalMeetings = activity.totalMeetings || '';
    
    // Format meeting number with spaces around the slash to prevent Excel from interpreting as date
    // The spaces will make Excel treat it as text instead of a date
    const meetingNumberText = `${currentMeeting} / ${totalMeetings}`;
    
    return {
      ...activity,
      meetingNumber: meetingNumberText
    };
  });

  const columns = [
    { key: 'product.name', header: 'שם פעילות' },
    { key: 'product.type', header: 'סוג פעילות' },
    { key: 'startTime', header: 'שעת התחלה' },
    { key: 'formattedDayOfWeek', header: 'יום בשבוע' }, 
    { key: 'meetingNumber', header: 'מפגש מספר' }, 
    { key: 'numParticipants', header: 'מספר משתתפים' },
  ];
  
  downloadCSV(processedActivities, columns, filename);
};
