
import { useState, useEffect } from 'react';
import { Registration, Participant, Payment } from '@/types';
import { calculatePaymentStatus } from '@/utils/paymentUtils';

export const useParticipantCalculations = (
  registrations: Registration[],
  participants: Participant[],
  payments: Payment[],
  getPaymentsByRegistration: (registrationId: string) => Promise<Payment[]>
) => {
  // State to store calculated totals
  const [totalExpected, setTotalExpected] = useState(0);
  const [totalPaid, setTotalPaid] = useState(0);
  
  // Calculate total number of participants
  const totalParticipants = participants.length;
  
  // Use effect to calculate payment totals asynchronously
  useEffect(() => {
    const calculateTotals = async () => {
      let expected = 0;
      let paid = 0;
      
      // Calculate total expected payment
      expected = registrations.reduce(
        (sum, registration) => sum + registration.requiredAmount, 
        0
      );
      
      // Calculate total paid amount - needs to be done in series due to async nature
      for (const registration of registrations) {
        const regPayments = await getPaymentsByRegistration(registration.id);
        const regPaid = regPayments.reduce((pSum, payment) => pSum + payment.amount, 0);
        paid += regPaid;
      }
      
      setTotalExpected(expected);
      setTotalPaid(paid);
    };
    
    calculateTotals();
  }, [registrations, getPaymentsByRegistration]);
  
  return {
    totalParticipants,
    totalExpected,
    totalPaid,
    calculatePaymentStatus
  };
};
