
import { Registration, Participant, Payment } from '@/types';
import { calculatePaymentStatus } from '@/utils/paymentUtils';

export const useParticipantCalculations = (
  registrations: Registration[],
  participants: Participant[],
  payments: Payment[],
  getPaymentsByRegistration: (registrationId: string) => Payment[]
) => {
  // Calculate total number of participants
  const totalParticipants = participants.length;
  
  // Calculate total expected payment
  const totalExpected = registrations.reduce(
    (sum, registration) => sum + registration.requiredAmount, 
    0
  );
  
  // Calculate total paid amount
  const totalPaid = registrations.reduce((sum, registration) => {
    const regPayments = getPaymentsByRegistration(registration.id);
    return sum + regPayments.reduce((pSum, payment) => pSum + payment.amount, 0);
  }, 0);
  
  return {
    totalParticipants,
    totalExpected,
    totalPaid,
    calculatePaymentStatus
  };
};
