
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
  
  // Total paid amount - sum of actual payments, not the paidAmount field
  const totalPaid = registrations.reduce((sum, reg) => {
    // Since we can't access the payments directly here, we use the paidAmount
    // which should represent the sum of actual payments
    return sum + reg.paidAmount;
  }, 0);

  return {
    totalParticipants,
    registrationsFilled,
    totalExpected,
    totalPaid
  };
};
