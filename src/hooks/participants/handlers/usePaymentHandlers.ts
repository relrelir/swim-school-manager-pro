
export const usePaymentHandlers = (
  baseHandleAddPayment: (
    e: React.FormEvent,
    newPayment: any,
    setIsAddPaymentOpen: (open: boolean) => void,
    setNewPayment: any
  ) => any,
  baseHandleApplyDiscount: (amount: number, setIsAddPaymentOpen: (open: boolean) => void, registrationId?: string) => any
) => {
  const handleAddPayment = (
    e: React.FormEvent,
    newPayment: any,
    setIsAddPaymentOpen: (open: boolean) => void,
    setNewPayment: any
  ) => {
    return baseHandleAddPayment(
      e,
      newPayment,
      setIsAddPaymentOpen,
      setNewPayment
    );
  };

  const handleApplyDiscount = (
    amount: number, 
    setIsAddPaymentOpen: (open: boolean) => void, 
    registrationId?: string
  ) => {
    return baseHandleApplyDiscount(
      amount,
      setIsAddPaymentOpen,
      registrationId
    );
  };

  return {
    handleAddPayment,
    handleApplyDiscount
  };
};
