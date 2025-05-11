
import { useState, useEffect, useCallback, useRef } from 'react';
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
  
  // Ref to prevent unnecessary recalculations
  const calculationCompleted = useRef(false);
  
  // Calculate total number of participants
  const totalParticipants = participants.length;
  
  // Reset calculation logic as requested
  const calculateTotals = useCallback(async () => {
    // We'll wait for new calculation instructions
    setIsCalculating(false);
    setTotalExpected(0);
    setTotalPaid(0);
    calculationCompleted.current = true;
  }, []);
  
  // Use effect with stable dependencies to prevent loop
  useEffect(() => {
    if (registrations.length > 0) {
      // Reset state if registrations change
      if (calculationCompleted.current && registrations.length > 0) {
        calculationCompleted.current = false;
      }
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
