
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Registration, Payment } from '@/types';

/**
 * Hook to manage and calculate participant table data
 * This will be completely reset per user request
 */
export const useParticipantsTableData = (
  registrations: Registration[],
  getPaymentsForRegistration: (registration: Registration | string) => Promise<Payment[]>,
  onPaymentTotalsCalculated?: (total: number) => void
) => {
  // Store payments for each registration
  const [registrationPayments, setRegistrationPayments] = useState<Record<string, Payment[]>>({});
  // Track loading state for payments
  const [isLoadingPayments, setIsLoadingPayments] = useState(false);
  // Track the initial loading state
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  
  // Stable registration IDs for dependency tracking
  const registrationIds = useMemo(() => 
    registrations.map(reg => reg.id).join(','), 
    [registrations]
  );
  
  // Fetch payments for all registrations
  const fetchPaymentsForRegistrations = useCallback(async () => {
    if (isInitialLoading) {
      setIsLoadingPayments(true);
    }
    
    const paymentsMap: Record<string, Payment[]> = {};
    
    try {
      for (const registration of registrations) {
        const payments = await getPaymentsForRegistration(registration);
        paymentsMap[registration.id] = payments;
      }
      
      setRegistrationPayments(paymentsMap);
      
      // Reset the calculation logic as requested
      // We'll wait for new instructions on how to calculate the totals
      if (onPaymentTotalsCalculated) {
        onPaymentTotalsCalculated(0); // Temporarily set to 0
      }
    } catch (error) {
      console.error('Failed to fetch payments for registrations:', error);
    } finally {
      setIsLoadingPayments(false);
      setIsInitialLoading(false);
    }
  }, [registrations, getPaymentsForRegistration, onPaymentTotalsCalculated, isInitialLoading]);
  
  // Fetch payments when component mounts or registrations change
  useEffect(() => {
    if (registrations.length > 0) {
      fetchPaymentsForRegistrations();
    }
  }, [registrationIds, fetchPaymentsForRegistrations]);

  return {
    registrationPayments,
    isLoadingPayments,
    isInitialLoading
  };
};
