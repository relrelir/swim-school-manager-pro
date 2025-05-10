
import { RegistrationWithDetails, PaymentStatus } from '@/types';

export interface ReportFilters {
  search: string;
  receiptNumber: string;
  seasonId: string;
  productId: string;
  paymentStatus: string;
  poolId: string; // Added poolId filter
}

export const filterRegistrations = (registrations: RegistrationWithDetails[], filters: ReportFilters): RegistrationWithDetails[] => {
  return registrations.filter(reg => {
    // Search filter - checks name, ID number, and phone
    if (filters.search && !`${reg.participant.firstName} ${reg.participant.lastName} ${reg.participant.idNumber} ${reg.participant.phone}`.includes(filters.search)) {
      return false;
    }

    // Receipt number filter
    if (filters.receiptNumber && !reg.payments?.some(p => p.receiptNumber?.includes(filters.receiptNumber))) {
      return false;
    }

    // Season filter
    if (filters.seasonId !== 'all' && reg.season.id !== filters.seasonId) {
      return false;
    }

    // Product filter
    if (filters.productId !== 'all' && reg.product.id !== filters.productId) {
      return false;
    }

    // Pool filter - added filter logic
    if (filters.poolId !== 'all' && reg.product.poolId !== filters.poolId) {
      return false;
    }

    // Payment status filter
    if (filters.paymentStatus !== 'all') {
      if (filters.paymentStatus === 'הנחה' && !reg.discountApproved) {
        return false;
      } else if (filters.paymentStatus !== 'הנחה' && reg.paymentStatus !== filters.paymentStatus) {
        return false;
      }
    }

    return true;
  });
};
