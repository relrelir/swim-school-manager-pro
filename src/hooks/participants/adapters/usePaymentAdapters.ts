
import { Registration } from '@/types';

/**
 * Hook for adapting payment-related functions to expected signatures
 */
export const usePaymentAdapters = (
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
  // Ensure we pass all parameters correctly, including the registration parameter
  const handleAddPaymentWrapper = (
    e: React.FormEvent, 
    newPayment: any,
    setIsAddPaymentOpen: (open: boolean) => void,
    setNewPayment: any,
    productId?: string,
    registration?: Registration | null
  ) => {
    return baseHandleAddPayment(e, newPayment, setIsAddPaymentOpen, setNewPayment, productId, registration);
  };

  const handleApplyDiscountAdapter = (
    amount: number,
    setIsAddPaymentOpen: (open: boolean) => void,
    productId?: string,
    registration?: Registration | null
  ) => {
    return baseHandleApplyDiscount(amount, setIsAddPaymentOpen, productId, registration);
  };

  return {
    handleAddPaymentWrapper,
    handleApplyDiscountAdapter
  };
};
