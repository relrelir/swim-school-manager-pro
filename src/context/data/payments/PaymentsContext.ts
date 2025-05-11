
import { createContext, useContext } from 'react';
import { Payment } from '@/types';

export interface PaymentsContextType {
  payments: Payment[];
  addPayment: (payment: Omit<Payment, 'id'>) => Promise<Payment | undefined>;
  updatePayment: (payment: Payment) => Promise<void>;
  deletePayment: (id: string) => Promise<void>;
  getPaymentsByRegistration: (registrationId: string) => Promise<Payment[]>;
  refreshPayments: () => Promise<void>;
  loading: boolean;
}

const PaymentsContext = createContext<PaymentsContextType | null>(null);

export const usePaymentsContext = () => {
  const context = useContext(PaymentsContext);
  if (!context) {
    throw new Error('usePaymentsContext must be used within a PaymentsProvider');
  }
  return context;
};

export default PaymentsContext;
