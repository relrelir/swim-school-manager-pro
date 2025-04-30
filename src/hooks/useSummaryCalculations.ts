
import { Product, Registration } from '@/types';

export const useSummaryCalculations = (registrations: Registration[], product?: Product) => {
  // Calculate totals
  const totalParticipants = registrations.length;
  const registrationsFilled = product ? (totalParticipants / product.maxParticipants) * 100 : 0;
  const totalExpected = registrations.reduce((sum, reg) => sum + reg.requiredAmount, 0);
  const totalPaid = registrations.reduce((sum, reg) => sum + reg.paidAmount, 0);

  return {
    totalParticipants,
    registrationsFilled,
    totalExpected,
    totalPaid
  };
};
