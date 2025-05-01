
import { useEffect, useState } from 'react';
import { Product, Registration } from '@/types';

/**
 * Hook for managing participant-related effects
 */
export const useParticipantEffects = (
  productId: string | undefined,
  products: any[],
  product: Product | undefined,
  getRegistrationsByProduct: (productId: string) => Registration[]
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

  // Calculate summary data
  const totalParticipants = registrations.length;
  const registrationsFilled = loadedProduct?.maxParticipants ? 
    Math.min(totalParticipants / loadedProduct.maxParticipants, 1) * 100 : 0;
  
  const totalExpected = registrations.reduce((sum, reg) => sum + reg.requiredAmount, 0);
  const totalPaid = registrations.reduce((sum, reg) => sum + reg.paidAmount, 0);

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
