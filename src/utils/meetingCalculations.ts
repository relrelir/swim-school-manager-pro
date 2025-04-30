
import { Product } from '@/types';

/**
 * Calculate meeting number for a product on a specific date
 * 
 * @param product The product to calculate the meeting number for
 * @param selectedDate The date to calculate the meeting number for
 * @returns Object containing current meeting number and total meetings
 */
export const calculateMeetingNumberForDate = (product: any, selectedDate: Date) => {
  const startDate = new Date(product.startDate);
  const today = new Date(selectedDate);
  
  if (today < startDate) return { current: 0, total: product.meetingsCount || 10 };
  
  const daysInWeekForProduct = product.daysOfWeek?.length || 1;
  const daysDiff = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Calculate how many meeting days based on days difference and meeting frequency
  const weeksPassed = Math.floor(daysDiff / 7);
  const meetingsPassed = (weeksPassed * daysInWeekForProduct) + 1; // +1 for the first meeting
  
  // Make sure we don't exceed total meetings
  const currentMeeting = Math.min(meetingsPassed, product.meetingsCount || 10);
  
  return {
    current: currentMeeting,
    total: product.meetingsCount || 10
  };
};
