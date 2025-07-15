
import { RegistrationWithDetails, PaymentStatus } from '@/types';

export interface ReportFilters {
  search: string;
  receiptNumber: string;
  seasonId: string[];
  productId: string[];
  paymentStatus: string[];
  poolId: string[];
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
    if (filters.seasonId.length > 0 && !filters.seasonId.some(id => id === 'all') && !filters.seasonId.includes(reg.season.id)) {
      return false;
    }

    // Product filter
    if (filters.productId.length > 0 && !filters.productId.some(id => id === 'all') && !filters.productId.includes(reg.product.id)) {
      return false;
    }

    // Pool filter
    if (filters.poolId.length > 0 && !filters.poolId.some(id => id === 'all') && !filters.poolId.includes(reg.product.poolId || '')) {
      return false;
    }

    // Payment status filter
    if (filters.paymentStatus.length > 0 && !filters.paymentStatus.some(status => status === 'all')) {
      const hasDiscount = filters.paymentStatus.includes('הנחה') && reg.discountApproved;
      const hasMatchingStatus = filters.paymentStatus.includes(reg.paymentStatus);
      
      if (!hasDiscount && !hasMatchingStatus) {
        return false;
      }
    }

    return true;
  });
};
