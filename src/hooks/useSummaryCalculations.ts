
import { Product, Registration } from '@/types';

export const useSummaryCalculations = (registrations: Registration[], product?: Product) => {
  // Calculate totals
  const totalParticipants = registrations.length;
  const registrationsFilled = product ? (totalParticipants / product.maxParticipants) * 100 : 0;
  
  // Calculate the total expected amount considering discounts
  const totalExpected = registrations.reduce((sum, reg) => {
    // Apply any discount to the required amount
    const discountAmount = reg.discountAmount || 0;
    const effectiveRequiredAmount = Math.max(0, reg.requiredAmount - (reg.discountApproved ? discountAmount : 0));
    return sum + effectiveRequiredAmount;
  }, 0);
  
  // Total paid amount - only actual payments, not including discounts
  const totalPaid = registrations.reduce((sum, reg) => {
    // Get payments for this registration (assuming they're filtered to include only actual payments)
    return sum + reg.paidAmount;
  }, 0);

  return {
    totalParticipants,
    registrationsFilled,
    totalExpected,
    totalPaid
  };
};
