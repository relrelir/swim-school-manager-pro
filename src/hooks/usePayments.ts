
import { usePaymentsContext } from '@/context/data/PaymentsProvider';

export const usePayments = () => {
  return usePaymentsContext();
};
