
import { processTextDirection, applyStrongDirectionalControl } from './pdf/hebrewTextHelper';

/**
 * Format a number as currency in ILS (New Israeli Shekel)
 * With enhanced directional control for PDF display
 */
export const formatCurrency = (amount: number): string => {
  const formatted = new Intl.NumberFormat('he-IL', { 
    style: 'currency', 
    currency: 'ILS' 
  }).format(amount);
  
  // Apply strong directional control for currency values
  return applyStrongDirectionalControl(formatted);
};

/**
 * Format a date in the local format
 * With enhanced directional control for PDF display
 */
export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  try {
    // Format date with day first for Israeli format
    const formattedDate = dateObj.toLocaleDateString('he-IL');
    
    // Apply strong directional control for dates
    return applyStrongDirectionalControl(formattedDate);
  } catch (error) {
    console.error('Error formatting date:', error);
    // Return safely processed string if there's an error
    const fallbackDate = typeof date === 'string' ? date : date.toString();
    return applyStrongDirectionalControl(fallbackDate);
  }
};

/**
 * Format a price (alias to formatCurrency for better semantics)
 * With enhanced directional control
 */
export const formatPrice = (price: number): string => {
  return formatCurrency(price);
};

/**
 * Format time from 24h format to local time format
 * With enhanced directional control for PDF display
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
    const formattedTime = date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
    
    // Apply strong directional control for time values
    return applyStrongDirectionalControl(formattedTime);
  } catch (e) {
    console.error('Error formatting time:', e);
    // Return safely processed original if there's an error
    return applyStrongDirectionalControl(time);
  }
};

/**
 * Format participants count as "X/Y"
 * With enhanced directional control for PDF display
 */
export const formatParticipantsCount = (current: number, max: number | undefined): string => {
  if (max === undefined || max === null) {
    return applyStrongDirectionalControl(`${current}`);
  }
  return applyStrongDirectionalControl(`${current}/${max}`);
};

/**
 * Format meeting count as "X/Y"
 * With enhanced directional control for PDF display
 */
export const formatMeetingCount = (current: number, total: number): string => {
  return applyStrongDirectionalControl(`${current}/${total}`);
};
