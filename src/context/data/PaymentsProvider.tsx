
import React from 'react';
import { Payment } from '@/types';
import { usePaymentsState } from './payments/usePaymentsState';
import PaymentsContext, { PaymentsContextType } from './payments/PaymentsContext';

interface PaymentsProviderProps {
  children: React.ReactNode;
}

export { usePaymentsContext } from './payments/PaymentsContext';

export const PaymentsProvider: React.FC<PaymentsProviderProps> = ({ children }) => {
  const {
    payments,
    loading,
    addPayment,
    updatePayment,
    deletePayment,
    getPaymentsByRegistration,
    refreshPayments
  } = usePaymentsState();

  const contextValue: PaymentsContextType = {
    payments,
    addPayment,
    updatePayment,
    deletePayment,
    getPaymentsByRegistration,
    refreshPayments,
    loading
  };

  return (
    <PaymentsContext.Provider value={contextValue}>
      {children}
    </PaymentsContext.Provider>
  );
};
