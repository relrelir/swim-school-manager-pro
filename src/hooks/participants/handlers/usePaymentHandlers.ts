
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
    return baseHandleAddPayment(
      e,
      newPayment,
      setIsAddPaymentOpen,
      setNewPayment,
      currentRegistration
    );
  };

  const handleApplyDiscount = (amount: number, setIsAddPaymentOpen: (open: boolean) => void, currentRegistration?: any) => {
    return baseHandleApplyDiscount(amount, setIsAddPaymentOpen, currentRegistration);
  };

  return {
    handleAddPayment,
    handleApplyDiscount
  };
};
