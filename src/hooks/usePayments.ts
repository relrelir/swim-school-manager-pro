
import { usePaymentsContext } from '@/context/data/payments/PaymentsContext';

export const usePayments = () => {
  return usePaymentsContext();
};
