
/**
 * Hook for adapting payment-related functions to expected signatures
 */
export const usePaymentAdapters = (
  baseHandleAddPayment: (
    e: React.FormEvent,
    newPayment: any,
    setIsAddPaymentOpen: (open: boolean) => void,
    setNewPayment: any
  ) => any,
  baseHandleApplyDiscount: (amount: number, setIsAddPaymentOpen: (open: boolean) => void) => any
) => {
  const handleAddPaymentWrapper = (
    e: React.FormEvent, 
    newPayment: any,
    setIsAddPaymentOpen: (open: boolean) => void,
    setNewPayment: any
  ) => {
    return baseHandleAddPayment(e, newPayment, setIsAddPaymentOpen, setNewPayment);
  };

  const handleApplyDiscountAdapter = (amount: number, setIsAddPaymentOpen: (open: boolean) => void) => {
    return baseHandleApplyDiscount(amount, setIsAddPaymentOpen);
  };

  return {
    handleAddPaymentWrapper,
    handleApplyDiscountAdapter
  };
};
