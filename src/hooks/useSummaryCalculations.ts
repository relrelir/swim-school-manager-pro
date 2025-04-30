
import { Product, Registration, Payment } from '@/types';

export const useSummaryCalculations = (registrations: Registration[], product?: Product, paymentsForRegistrations?: (registration: Registration) => Payment[]) => {
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
  
  // Total paid amount - calculate from actual payments if available, or fall back to paidAmount
  const totalPaid = registrations.reduce((sum, reg) => {
    if (paymentsForRegistrations) {
      // Get actual payments (excluding discounts) and sum their amounts
      const actualPayments = paymentsForRegistrations(reg);
      const actualPaymentSum = actualPayments.reduce((pSum, payment) => pSum + payment.amount, 0);
      return sum + actualPaymentSum;
    }
    // Fall back to paidAmount
    return sum + reg.paidAmount;
  }, 0);

  return {
    totalParticipants,
    registrationsFilled,
    totalExpected,
    totalPaid
  };
};
