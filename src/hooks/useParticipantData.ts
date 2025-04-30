
import { useState, useEffect } from 'react';
import { useSummaryCalculations } from './useSummaryCalculations';
import { Registration } from '@/types';

export const useParticipantData = (
  product: any, 
  productId: string | undefined, 
  getRegistrationsByProduct: (productId: string) => Registration[],
  getPaymentsForRegistration?: (registration: Registration) => any[]
) => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Load registrations data
  useEffect(() => {
    if (productId) {
      const productRegistrations = getRegistrationsByProduct(productId);
      setRegistrations(productRegistrations);
    }
  }, [productId, getRegistrationsByProduct, refreshTrigger]);
  
  // Calculate summary data
  const { 
    totalParticipants, 
    registrationsFilled, 
    totalExpected, 
    totalPaid 
  } = useSummaryCalculations(
    registrations, 
    product, 
    getPaymentsForRegistration
  );

  return {
    registrations,
    setRegistrations,
    refreshTrigger,
    setRefreshTrigger,
    totalParticipants,
    registrationsFilled,
    totalExpected,
    totalPaid
  };
};
