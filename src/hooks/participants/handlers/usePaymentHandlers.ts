
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
  baseHandleApplyDiscount: (amount: number, setIsAddPaymentOpen: (open: boolean) => void) => any
) => {
  // Ensure we pass all parameters correctly to baseHandleAddPayment
  const handleAddPayment = (
    e: React.FormEvent, 
    newPayment: any,
    setIsAddPaymentOpen: (open: boolean) => void,
    setNewPayment: any
  ) => {
    // Forward all arguments in the correct order
    return baseHandleAddPayment(
      e,
      newPayment,
      setIsAddPaymentOpen,
      setNewPayment
    );
  };

  const handleApplyDiscount = (amount: number, setIsAddPaymentOpen: (open: boolean) => void) => {
    return baseHandleApplyDiscount(amount, setIsAddPaymentOpen);
  };

  return {
    handleAddPayment,
    handleApplyDiscount
  };
};
