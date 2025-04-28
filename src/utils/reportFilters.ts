
import { RegistrationWithDetails } from '@/types';

export interface ReportFilters {
  search: string;
  receiptNumber: string;
  seasonId: string;
  productId: string;
  paymentStatus: string;
}

// Apply filters to registrations
export const filterRegistrations = (registrations: RegistrationWithDetails[], filters: ReportFilters): RegistrationWithDetails[] => {
  return registrations.filter(registration => {
    // Search filter (name or ID)
    const nameMatch = `${registration.participant.firstName} ${registration.participant.lastName}`.toLowerCase().includes(filters.search.toLowerCase());
    const idMatch = registration.participant.idNumber.includes(filters.search);
    
    if (filters.search && !nameMatch && !idMatch) {
      return false;
    }
    
    // Receipt number filter
    if (filters.receiptNumber && !registration.receiptNumber.includes(filters.receiptNumber)) {
      return false;
    }
    
    // Season filter
    if (filters.seasonId && filters.seasonId !== 'all' && registration.season.id !== filters.seasonId) {
      return false;
    }
    
    // Product filter
    if (filters.productId && filters.productId !== 'all' && registration.product.id !== filters.productId) {
      return false;
    }
    
    // Payment status filter
    if (filters.paymentStatus && filters.paymentStatus !== 'all' && registration.paymentStatus !== filters.paymentStatus) {
      return false;
    }
    
    return true;
  });
};
