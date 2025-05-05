
import { processTextDirection, forceLtrDirection, processTableCellText, processHebrewCurrencyForTable } from './pdf/helpers/textDirection';
import { formatPdfField } from './pdf/helpers/textFormatting';

/**
 * Format a number as currency in ILS (New Israeli Shekel)
 * Enhanced with proper direction markers for PDF display
 */
export const formatCurrency = (amount: number): string => {
  const formatted = new Intl.NumberFormat('he-IL', { 
    style: 'currency', 
    currency: 'ILS' 
  }).format(amount);
  
  // Format currency values with LTR markers
  return formatPdfField(formatted, 'number');
};

/**
 * Special formatter for currency values in tables
 * This uses specific handling to ensure proper display in PDF tables
 */
export const formatCurrencyForTable = (amount: number): string => {
  const formatted = new Intl.NumberFormat('he-IL', { 
    style: 'currency', 
    currency: 'ILS' 
  }).format(amount);
  
  // Format currency values with LTR markers
  return formatPdfField(formatted, 'number');
};

/**
 * Format a date in the local format
 * Enhanced with LTR direction markers
 */
export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  // Apply direction handling specifically for dates
  return formatPdfField(dateObj.toLocaleDateString('he-IL'), 'number');
};

/**
 * Format a price (alias to formatCurrency for better semantics)
 */
export const formatPrice = (price: number): string => {
  return formatCurrency(price);
};

/**
 * Format time from 24h format to local time format
 * Enhanced with LTR direction markers
 */
export const formatTime = (time: string): string => {
  try {
    if (!time) return '';
    
    // Parse hours and minutes from time string (expecting format like "14:30")
    const [hours, minutes] = time.split(':').map(Number);
    
    // Create a date object to use toLocaleTimeString
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    
    // Format time with LTR markers
    return formatPdfField(date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }), 'number');
  } catch (e) {
    console.error('Error formatting time:', e);
    return formatPdfField(time, 'number'); // Return original with LTR direction if there's an error
  }
};

/**
 * Format participants count as "X/Y" with LTR direction markers
 */
export const formatParticipantsCount = (current: number, max: number | undefined): string => {
  if (max === undefined || max === null) {
    return formatPdfField(`${current}`, 'number');
  }
  return formatPdfField(`${current}/${max}`, 'number');
};

/**
 * Format meeting count as "X/Y" with LTR direction markers
 */
export const formatMeetingCount = (current: number, total: number): string => {
  return formatPdfField(`${current}/${total}`, 'number');
};
