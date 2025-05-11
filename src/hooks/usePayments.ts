
import { useContext } from 'react';
import { Payment } from '@/types';
import { PaymentsContext } from '@/context/data/PaymentsProvider';

// Add a proper context type file if it doesn't exist
interface PaymentsContextType {
  payments: Payment[];
  addPayment: (payment: Omit<Payment, 'id'>) => Promise<Payment | undefined>;
  updatePayment: (payment: Payment) => Promise<void>;
  deletePayment: (id: string) => Promise<void>;
  getPaymentsByRegistration: (registrationId: string) => Payment[];
  loading: boolean;
}

export const usePayments = () => {
  const context = useContext(PaymentsContext) as PaymentsContextType;
  
  if (!context) {
    throw new Error('usePayments must be used within PaymentsProvider');
  }
  
  return context;
};
