
import React, { createContext, useContext, useMemo } from 'react';
import { useSeasonsContext } from './SeasonsProvider';
import { useProductsContext } from './ProductsProvider';
import { useParticipantsContext } from './ParticipantsProvider';
import { useRegistrationsContext } from './RegistrationsProvider';
import { usePaymentsContext } from './PaymentsProvider';
import { Participant, Product, PaymentStatus, RegistrationWithDetails } from '@/types';

interface DailyActivity {
  startTime: string | undefined;
  product: Product;
  numParticipants: number;
}

interface CombinedDataContextValue {
  getRegistrationDetails: (productId: string) => RegistrationWithDetails[];
  getAllRegistrationsWithDetails: () => RegistrationWithDetails[];
  getParticipantsByProduct: (productId: string) => Participant[];
  getDailyActivities: (date: string) => DailyActivity[];
}

const CombinedDataContext = createContext<CombinedDataContextValue | null>(null);

export const useCombinedDataContext = () => {
  const context = useContext(CombinedDataContext);
  if (!context) {
    throw new Error('useCombinedDataContext must be used within a CombinedDataProvider');
  }
  return context;
};

interface CombinedDataProviderProps {
  children: React.ReactNode;
}

export const CombinedDataProvider: React.FC<CombinedDataProviderProps> = ({ children }) => {
  const { seasons } = useSeasonsContext();
  const { products } = useProductsContext();
  const { participants } = useParticipantsContext();
  const { registrations, calculatePaymentStatus } = useRegistrationsContext();
  const { payments } = usePaymentsContext();

  const contextValue = useMemo(() => {
    // Get registration details for a specific product
    const getRegistrationDetails = (productId: string): RegistrationWithDetails[] => {
      const productRegistrations = registrations.filter(r => r.productId === productId);
      
      return productRegistrations.map(registration => {
        const participant = participants.find(p => p.id === registration.participantId);
        const product = products.find(p => p.id === registration.productId);
        const season = product ? seasons.find(s => s.id === product.seasonId) : undefined;
        const paymentStatus = calculatePaymentStatus(registration);
        const registrationPayments = payments.filter(p => p.registrationId === registration.id);
        
        return {
          ...registration,
          participant: participant!,
          product: product!,
          season: season!,
          paymentStatus,
          payments: registrationPayments,
        };
      });
    };

    // Get all registrations with details
    const getAllRegistrationsWithDetails = (): RegistrationWithDetails[] => {
      return registrations.map(registration => {
        const participant = participants.find(p => p.id === registration.participantId);
        const product = products.find(p => p.id === registration.productId);
        const season = product ? seasons.find(s => s.id === product.seasonId) : undefined;
        const paymentStatus = calculatePaymentStatus(registration);
        const registrationPayments = payments.filter(p => p.registrationId === registration.id);
        
        return {
          ...registration,
          participant: participant!,
          product: product!,
          season: season!,
          paymentStatus,
          payments: registrationPayments,
        };
      });
    };

    // Get participants by product
    const getParticipantsByProduct = (productId: string): Participant[] => {
      const productRegistrations = registrations.filter(r => r.productId === productId);
      return productRegistrations
        .map(registration => participants.find(p => p.id === registration.participantId))
        .filter((participant): participant is Participant => participant !== undefined);
    };

    // Get daily activities
    const getDailyActivities = (date: string): DailyActivity[] => {
      // Filter products that are active on the selected date
      const activeProducts = products.filter(product => {
        const productDate = new Date(product.startDate);
        const selectedDate = new Date(date);
        
        // If the product has specific days of the week
        if (product.daysOfWeek && product.daysOfWeek.length > 0) {
          const dayOfWeek = selectedDate.getDay();
          const daysMap: Record<string, number> = {
            'ראשון': 0,
            'שני': 1,
            'שלישי': 2,
            'רביעי': 3,
            'חמישי': 4,
            'שישי': 5,
            'שבת': 6
          };
          
          // Check if the selected day is in the product's days of week
          const isActiveDay = product.daysOfWeek.some(day => daysMap[day] === dayOfWeek);
          
          // The product should be active on this day of week and within its date range
          const startDate = new Date(product.startDate);
          const endDate = new Date(product.endDate);
          
          return isActiveDay && 
                 selectedDate >= startDate && 
                 selectedDate <= endDate;
        } else {
          // For products without specific days, just check if the date is within range
          const startDate = new Date(product.startDate);
          const endDate = new Date(product.endDate);
          
          return selectedDate >= startDate && selectedDate <= endDate;
        }
      });
      
      // Map to the required structure with participant count
      return activeProducts.map(product => {
        const productRegistrations = registrations.filter(r => r.productId === product.id);
        return {
          startTime: product.startTime,
          product,
          numParticipants: productRegistrations.length
        };
      }).sort((a, b) => {
        // Sort by start time if available
        if (a.startTime && b.startTime) {
          return a.startTime.localeCompare(b.startTime);
        } else if (a.startTime) {
          return -1;
        } else if (b.startTime) {
          return 1;
        }
        // Fallback to product name
        return a.product.name.localeCompare(b.product.name);
      });
    };

    return {
      getRegistrationDetails,
      getAllRegistrationsWithDetails,
      getParticipantsByProduct,
      getDailyActivities,
    };
  }, [seasons, products, participants, registrations, payments, calculatePaymentStatus]);

  return (
    <CombinedDataContext.Provider value={contextValue}>
      {children}
    </CombinedDataContext.Provider>
  );
};
