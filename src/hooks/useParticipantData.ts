
import { useState, useEffect } from 'react';
import { Product, Registration, Participant } from '@/types';

export const useParticipantData = (
  product: any,
  productId: string | undefined,
  getRegistrationsByProduct: (productId: string) => Registration[]
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
  const calculateSummaryData = (registrations: Registration[], product?: Product) => {
    const totalParticipants = registrations.length;
    const registrationsFilled = product?.maxParticipants 
      ? Math.min(100, Math.round((totalParticipants / product.maxParticipants) * 100))
      : 0;
      
    const totalExpected = registrations.reduce((sum, reg) => sum + reg.requiredAmount, 0);
    const totalPaid = registrations.reduce((sum, reg) => sum + reg.paidAmount, 0);
    
    return {
      totalParticipants,
      registrationsFilled,
      totalExpected,
      totalPaid
    };
  };

  const summaryData = calculateSummaryData(registrations, product);

  return {
    registrations,
    setRegistrations,
    refreshTrigger,
    setRefreshTrigger,
    ...summaryData
  };
};
