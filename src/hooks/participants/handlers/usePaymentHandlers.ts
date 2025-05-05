
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
    registration?: any
  ) => any,
  baseHandleApplyDiscount: (
    amount: number, 
    setIsAddPaymentOpen: (open: boolean) => void,
    productId?: string,
    registration?: any
  ) => any
) => {
  const handleAddPayment = (
    e: React.FormEvent, 
    newPayment: any,
    setIsAddPaymentOpen: (open: boolean) => void,
    setNewPayment: any,
    productId?: string,
    registration?: any
  ) => {
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
    registration?: any
  ) => {
    return baseHandleApplyDiscount(amount, setIsAddPaymentOpen, productId, registration);
  };

  return {
    handleAddPayment,
    handleApplyDiscount
  };
};
