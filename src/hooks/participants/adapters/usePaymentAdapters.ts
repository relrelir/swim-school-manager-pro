
import { Registration } from '@/types';

/**
 * Adapter hook for payment-related functions
 */
export const usePaymentAdapters = (
  baseHandleAddPayment: (
    e: React.FormEvent,
    newPayment: any,
    setIsAddPaymentOpen: (open: boolean) => void,
    setNewPayment: any,
    currentRegistration?: any
  ) => any,
  baseHandleApplyDiscount: (amount: number, setIsAddPaymentOpen: (open: boolean) => void, currentRegistration?: any) => any
) => {
  // Handler wrappers for payment and discount operations
  const handleAddPaymentWrapper = (
    e: React.FormEvent, 
    newPayment: any,
    setIsAddPaymentOpen: (open: boolean) => void,
    setNewPayment: any,
    currentRegistration?: Registration | null
  ) => {
    console.log("handleAddPaymentWrapper in usePaymentAdapters, currentRegistration:", currentRegistration);
    return baseHandleAddPayment(e, newPayment, setIsAddPaymentOpen, setNewPayment, currentRegistration);
  };

  const handleApplyDiscountAdapter = (
    amount: number, 
    setIsAddPaymentOpen: (open: boolean) => void,
    currentRegistration?: Registration | null
  ) => {
    console.log("handleApplyDiscountAdapter in usePaymentAdapters, currentRegistration:", currentRegistration);
    return baseHandleApplyDiscount(amount, setIsAddPaymentOpen, currentRegistration);
  };

  return {
    handleAddPaymentWrapper,
    handleApplyDiscountAdapter
  };
};
