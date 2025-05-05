
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
    registration?: any
  ) => any,
  baseHandleApplyDiscount: (
    amount: number, 
    setIsAddPaymentOpen: (open: boolean) => void,
    productId?: string,
    registration?: any
  ) => any
) => {
  const handleAddPaymentWrapper = (
    e: React.FormEvent, 
    newPayment: any,
    setIsAddPaymentOpen: (open: boolean) => void,
    setNewPayment: any,
    productId?: string,
    registration?: any
  ) => {
    return baseHandleAddPayment(e, newPayment, setIsAddPaymentOpen, setNewPayment, productId, registration);
  };

  const handleApplyDiscountAdapter = (
    amount: number, 
    setIsAddPaymentOpen: (open: boolean) => void,
    productId?: string,
    registration?: any
  ) => {
    return baseHandleApplyDiscount(amount, setIsAddPaymentOpen, productId, registration);
  };

  return {
    handleAddPaymentWrapper,
    handleApplyDiscountAdapter
  };
};
