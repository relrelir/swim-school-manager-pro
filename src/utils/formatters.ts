import { format } from 'date-fns';

/**
 * Format a date string to a localized format (dd/MM/yyyy)
 */
export const formatDate = (dateString: string) => {
  try {
    return format(new Date(dateString), 'dd/MM/yyyy');
  } catch (e) {
    return dateString;
  }
};

/**
 * Format a time string to HH:mm format
 */
export const formatTime = (timeString: string | undefined) => {
  if (!timeString) return '-';
  
  // If time is already in HH:mm format, return it
  if (/^\d{2}:\d{2}$/.test(timeString)) {
    return timeString;
  }
  
  // Otherwise try to extract hours and minutes
  try {
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
  } catch (e) {
    return timeString;
  }
};

/**
 * Format price with ILS currency symbol
 */
export const formatPrice = (price: number) => {
  return new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(price);
};

/**
 * Format meeting count as current/total
 */
export const formatMeetingCount = (current: number, total: number) => {
  return `${current}/${total}`;
};

/**
 * Format participants count as current/max
 */
export const formatParticipantsCount = (current: number, max: number) => {
  return `${current}/${max}`;
};
