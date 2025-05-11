
import { useState, useEffect, useCallback } from 'react';
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
  
  // Memoized calculation function to reduce re-renders
  const calculateTotals = useCallback(async () => {
    // Only set loading state if we don't already have values
    if (totalExpected === 0 && totalPaid === 0) {
      setIsCalculating(true);
    }
    
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
      }
      
      setTotalExpected(expected);
      setTotalPaid(paid);
    } catch (error) {
      console.error("Error calculating payment totals:", error);
    } finally {
      setIsCalculating(false);
    }
  }, [registrations, getPaymentsByRegistration]);
  
  // Use effect with stable dependencies to prevent loop
  useEffect(() => {
    if (registrations.length > 0) {
      calculateTotals();
    } else {
      setIsCalculating(false);
      setTotalExpected(0);
      setTotalPaid(0);
    }
  }, [registrations.length, calculateTotals]);
  
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
