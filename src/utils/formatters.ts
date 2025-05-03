
import { processTextDirection } from './pdf/hebrewTextHelper';

/**
 * Format a number as currency in ILS (New Israeli Shekel)
 */
export const formatCurrency = (amount: number): string => {
  // Create the formatted currency string
  const formatted = new Intl.NumberFormat('he-IL', { 
    style: 'currency', 
    currency: 'ILS' 
  }).format(amount);
  
  // Ensure the currency is treated as LTR content when used in RTL context
  return processTextDirection(formatted, true);
};

/**
 * Format a date in the local format
 */
export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const formatted = dateObj.toLocaleDateString('he-IL');
  
  // Ensure the date is treated as LTR content when used in RTL context
  return processTextDirection(formatted, true);
};

/**
 * Format a price (alias to formatCurrency for better semantics)
 */
export const formatPrice = (price: number): string => {
  return formatCurrency(price);
};

/**
 * Format time from 24h format to local time format
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
    
    // Format time according to locale (without seconds)
    const formatted = date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
    
    // Ensure the time is treated as LTR content when used in RTL context
    return processTextDirection(formatted, true);
  } catch (e) {
    console.error('Error formatting time:', e);
    return time; // Return original if there's an error
  }
};

/**
 * Format participants count as "X/Y"
 */
export const formatParticipantsCount = (current: number, max: number | undefined): string => {
  if (max === undefined || max === null) {
    return processTextDirection(`${current}`, true);
  }
  return processTextDirection(`${current}/${max}`, true);
};

/**
 * Format meeting count as "X/Y"
 */
export const formatMeetingCount = (current: number, total: number): string => {
  return processTextDirection(`${current}/${total}`, true);
};
