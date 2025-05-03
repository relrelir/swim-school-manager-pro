
import { processTextDirection, forceLtrDirection, forceRtlDirection, forceTableCurrencyDirection } from './pdf/hebrewTextHelper';

/**
 * Format a number as currency in ILS (New Israeli Shekel)
 * Enhanced with stronger LTR direction control
 */
export const formatCurrency = (amount: number): string => {
  const formatted = new Intl.NumberFormat('he-IL', { 
    style: 'currency', 
    currency: 'ILS' 
  }).format(amount);
  
  // Force LTR direction for currency values (they contain numbers)
  return forceLtrDirection(formatted);
};

/**
 * Special formatter for currency values displayed in tables
 * Enhanced to handle the unique requirements of jspdf-autotable
 */
export const formatCurrencyForTable = (amount: number): string => {
  const formatted = new Intl.NumberFormat('he-IL', { 
    style: 'currency', 
    currency: 'ILS' 
  }).format(amount);
  
  // Special handling for tables
  return forceTableCurrencyDirection(formatted);
};

/**
 * Format a date in the local format
 * Enhanced with strongest possible LTR direction control
 */
export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  // Apply strongest direction handling specifically for dates
  return forceLtrDirection(dateObj.toLocaleDateString('he-IL'));
};

/**
 * Format a price (alias to formatCurrency for better semantics)
 */
export const formatPrice = (price: number): string => {
  return formatCurrency(price);
};

/**
 * Format time from 24h format to local time format
 * Enhanced with strongest possible LTR direction control
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
    
    // Format time according to locale (without seconds) with strongest LTR control
    return forceLtrDirection(date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }));
  } catch (e) {
    console.error('Error formatting time:', e);
    return forceLtrDirection(time); // Return original with LTR direction if there's an error
  }
};

/**
 * Format participants count as "X/Y" with strong LTR direction control
 */
export const formatParticipantsCount = (current: number, max: number | undefined): string => {
  if (max === undefined || max === null) {
    return forceLtrDirection(`${current}`);
  }
  return forceLtrDirection(`${current}/${max}`);
};

/**
 * Format meeting count as "X/Y" with strong LTR direction control
 */
export const formatMeetingCount = (current: number, total: number): string => {
  return forceLtrDirection(`${current}/${total}`);
};

