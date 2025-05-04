
import { Registration } from '@/types';

/**
 * Hook for handling payment-related interactions
 */
export const usePaymentHandlers = (
  baseHandleAddPayment: (
    e: React.FormEvent,
    newPayment: any,
    setIsAddPaymentOpen: (open: boolean) => void,
    setNewPayment: any
  ) => any,
  baseHandleApplyDiscount: (amount: number, setIsAddPaymentOpen: (open: boolean) => void) => any,
  currentRegistration: Registration | null = null
) => {
  const handleAddPayment = (
    e: React.FormEvent, 
    newPayment: any,
    setIsAddPaymentOpen: (open: boolean) => void,
    setNewPayment: any
  ) => {
    console.log("Payment handler called with currentRegistration:", currentRegistration);
    return baseHandleAddPayment(
      e,
      newPayment,
      setIsAddPaymentOpen,
      setNewPayment
    );
  };

  const handleApplyDiscount = (amount: number, setIsAddPaymentOpen: (open: boolean) => void) => {
    console.log("Apply discount handler called with currentRegistration:", currentRegistration);
    return baseHandleApplyDiscount(amount, setIsAddPaymentOpen);
  };

  return {
    handleAddPayment,
    handleApplyDiscount
  };
};
