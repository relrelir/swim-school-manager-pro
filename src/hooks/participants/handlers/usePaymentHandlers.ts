
import { Registration } from '@/types';

/**
 * Hook for handling payment-related interactions
 */
export const usePaymentHandlers = (
  baseHandleAddPayment: (
    e: React.FormEvent,
    newPayment: any,
    setIsAddPaymentOpen: (open: boolean) => void,
    setNewPayment: any,
    productId?: string,
    registration?: Registration | null
  ) => any,
  baseHandleApplyDiscount: (
    amount: number, 
    setIsAddPaymentOpen: (open: boolean) => void,
    productId?: string,
    registration?: Registration | null
  ) => any
) => {
  // Ensure we pass all parameters correctly to baseHandleAddPayment
  const handleAddPayment = (
    e: React.FormEvent, 
    newPayment: any,
    setIsAddPaymentOpen: (open: boolean) => void,
    setNewPayment: any,
    productId?: string,
    registration?: Registration | null
  ) => {
    // Forward all arguments in the correct order
    return baseHandleAddPayment(
      e,
      newPayment,
      setIsAddPaymentOpen,
      setNewPayment,
      productId,
      registration
    );
  };

  const handleApplyDiscount = (
    amount: number, 
    setIsAddPaymentOpen: (open: boolean) => void,
    productId?: string,
    registration?: Registration | null
  ) => {
    return baseHandleApplyDiscount(amount, setIsAddPaymentOpen, productId, registration);
  };

  return {
    handleAddPayment,
    handleApplyDiscount
  };
};
