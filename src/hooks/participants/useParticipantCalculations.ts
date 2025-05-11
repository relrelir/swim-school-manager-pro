
import { useState, useEffect } from 'react';
import { Registration, Participant, Payment, PaymentStatusDetails } from '@/types';
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
  const [isCalculating, setIsCalculating] = useState(false);
  
  // Calculate total number of participants
  const totalParticipants = participants.length;
  
  // Use effect to calculate payment totals asynchronously
  useEffect(() => {
    const calculateTotals = async () => {
      setIsCalculating(true);
      let expected = 0;
      let paid = 0;
      
      try {
        // Calculate total expected payment, considering discounts
        expected = registrations.reduce((sum, registration) => {
          const discountAmount = registration.discountAmount || 0;
          const effectiveAmount = registration.discountApproved 
            ? Math.max(0, registration.requiredAmount - discountAmount) 
            : registration.requiredAmount;
          return sum + effectiveAmount;
        }, 0);
        
        // Calculate total paid amount - needs to be done in series due to async nature
        for (const registration of registrations) {
          const regPayments = await getPaymentsByRegistration(registration.id);
          const regPaid = regPayments.reduce((pSum, payment) => pSum + Number(payment.amount), 0);
          paid += regPaid;
          
          console.log(`Registration ${registration.id} has payments totaling: ${regPaid}`);
        }
        
        console.log(`Total calculation completed: Expected=${expected}, Paid=${paid}`);
        
        setTotalExpected(expected);
        setTotalPaid(paid);
      } catch (error) {
        console.error("Error calculating payment totals:", error);
      } finally {
        setIsCalculating(false);
      }
    };
    
    if (registrations.length > 0) {
      calculateTotals();
    } else {
      setIsCalculating(false);
    }
  }, [registrations, getPaymentsByRegistration]);
  
  // Create function to calculate payment status details for a registration
  const calculatePaymentDetails = async (registration: Registration): Promise<PaymentStatusDetails> => {
    const payments = await getPaymentsByRegistration(registration.id);
    return calculatePaymentStatus(registration, payments);
  };
  
  return {
    totalParticipants,
    totalExpected,
    totalPaid,
    isCalculating,
    calculatePaymentStatus,
    calculatePaymentDetails
  };
};
