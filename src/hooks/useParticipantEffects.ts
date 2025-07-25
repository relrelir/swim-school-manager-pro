
import { useEffect, useState } from 'react';
import { Product, Registration, Payment } from '@/types';
import { useSummaryCalculations } from './useSummaryCalculations';

/**
 * Hook for managing participant-related effects
 */
export const useParticipantEffects = (
  productId: string | undefined,
  products: any[],
  product: Product | undefined,
  getRegistrationsByProduct: (productId: string) => Registration[],
  getPaymentsForRegistration?: (registration: Registration) => Payment[]
) => {
  const [loadedProduct, setLoadedProduct] = useState<Product | undefined>(undefined);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Load product data
  useEffect(() => {
    if (productId) {
      const currentProduct = products.find(p => p.id === productId);
      setLoadedProduct(currentProduct);
    }
  }, [productId, products]);

  // Load registrations
  useEffect(() => {
    if (productId) {
      const productRegistrations = getRegistrationsByProduct(productId);
      setRegistrations(productRegistrations);
    }
  }, [productId, getRegistrationsByProduct, refreshTrigger]);

  // Use the shared summary calculations hook with payments function
  const { 
    totalParticipants, 
    registrationsFilled, 
    totalExpected, 
    totalPaid 
  } = useSummaryCalculations(registrations, loadedProduct, getPaymentsForRegistration);

  return {
    product: loadedProduct, 
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
