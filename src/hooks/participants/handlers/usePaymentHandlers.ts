
/**
 * Hook for handling payment-related interactions
 */
export const usePaymentHandlers = (
  baseHandleAddPayment: (
    e: React.FormEvent,
    newPayment: any,
    setIsAddPaymentOpen: (open: boolean) => void,
    setNewPayment: any,
    currentRegistration?: any
  ) => any,
  baseHandleApplyDiscount: (amount: number, setIsAddPaymentOpen: (open: boolean) => void, currentRegistration?: any) => any
) => {
  const handleAddPayment = (
    e: React.FormEvent, 
    newPayment: any,
    setIsAddPaymentOpen: (open: boolean) => void,
    setNewPayment: any,
    currentRegistration?: any
  ) => {
    console.log("usePaymentHandlers handleAddPayment called with currentRegistration:", currentRegistration);
    return baseHandleAddPayment(
      e,
      newPayment,
      setIsAddPaymentOpen,
      setNewPayment,
      currentRegistration
    );
  };

  const handleApplyDiscount = (amount: number, setIsAddPaymentOpen: (open: boolean) => void, currentRegistration?: any) => {
    console.log("usePaymentHandlers handleApplyDiscount called with currentRegistration:", currentRegistration);
    return baseHandleApplyDiscount(amount, setIsAddPaymentOpen, currentRegistration);
  };

  return {
    handleAddPayment,
    handleApplyDiscount
  };
};
