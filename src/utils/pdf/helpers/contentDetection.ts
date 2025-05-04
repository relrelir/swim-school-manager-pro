
/**
 * Detect if a cell is likely currency by checking for common currency indicators
 */
export const isCurrencyCell = (cellText: string): boolean => {
  if (!cellText) return false;
  return /[₪$€£]|ILS/.test(cellText) || /^[\d,\.]+\s*(?:[₪$€£]|ILS)/.test(cellText);
};

/**
 * Detect if text contains English characters or numbers only
 */
export const isEnglishOrNumber = (text: string): boolean => {
  if (!text) return false;
  // Match English letters, numbers, and common punctuation only
  return /^[a-zA-Z0-9\s\-\.\/\(\)\+\:]+$/.test(text);
};

/**
 * Detect if text contains numbers only (for phone numbers, ID numbers)
 */
export const isNumberOnly = (text: string): boolean => {
  if (!text) return false;
  // Match only digits and common number formatting characters
  return /^[0-9\s\-\.\/]+$/.test(text);
};

/**
 * Detect if text is a date in common formats
 */
export const isDateFormat = (text: string): boolean => {
  if (!text) return false;
  // Match common date formats (dd/mm/yyyy, etc.)
  return /^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(text);
};

/**
 * Detect if text is a phone number format
 */
export const isPhoneFormat = (text: string): boolean => {
  if (!text) return false;
  // Match common Israeli phone formats
  return /^0\d{1,2}[\-\s]?\d{7,8}$/.test(text);
};

/**
 * Detect if text is Hebrew currency (contains ₪ or 'ILS')
 */
export const isHebrewCurrency = (text: string): boolean => {
  if (!text) return false;
  return /[₪]|ILS/.test(text);
};

/**
 * Detect if text contains Hebrew characters
 */
export const containsHebrew = (text: string): boolean => {
  if (!text) return false;
  // Hebrew Unicode range
  return /[\u0590-\u05FF]/.test(text);
};
