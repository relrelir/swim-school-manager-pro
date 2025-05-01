
/**
 * Format a number as currency in ILS (New Israeli Shekel)
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('he-IL', { 
    style: 'currency', 
    currency: 'ILS' 
  }).format(amount);
};

/**
 * Format a date in the local format
 */
export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('he-IL');
};
