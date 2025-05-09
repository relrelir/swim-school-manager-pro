
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
  baseHandleApplyDiscount: (amount: number, setIsAddPaymentOpen: (open: boolean) => void, registrationId?: string) => any
) => {
  const handleAddPaymentWrapper = (
    e: React.FormEvent, 
    newPayment: any,
    setIsAddPaymentOpen: (open: boolean) => void,
    setNewPayment: any
  ) => {
    return baseHandleAddPayment(e, newPayment, setIsAddPaymentOpen, setNewPayment);
  };

  // Update the adapter to accept registrationId
  const handleApplyDiscountAdapter = (amount: number, setIsAddPaymentOpen: (open: boolean) => void, registrationId?: string) => {
    return baseHandleApplyDiscount(amount, setIsAddPaymentOpen, registrationId);
  };

  return {
    handleAddPaymentWrapper,
    handleApplyDiscountAdapter
  };
};
