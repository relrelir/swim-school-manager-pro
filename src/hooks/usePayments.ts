
import { Payment } from '@/types';
import { usePaymentsContext } from '@/context/data/PaymentsProvider';

export const usePayments = () => {
  const context = usePaymentsContext();
  
  if (!context) {
    throw new Error('usePayments must be used within PaymentsProvider');
  }
  
  return context;
};
