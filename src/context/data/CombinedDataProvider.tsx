
import React, { createContext, useContext } from 'react';
import { useRegistrationsContext } from './RegistrationsProvider';
import { useSeasonsContext } from './SeasonsProvider';
import { useProductsContext } from './ProductsProvider';
import { useParticipantsContext } from './ParticipantsProvider';
import { usePaymentsContext } from './PaymentsProvider';
import { RegistrationWithDetails } from '@/types';

interface CombinedDataContextType {
  getAllRegistrationsWithDetails: () => RegistrationWithDetails[];
  getDailyActivities: (date: string) => any[];
}

const CombinedDataContext = createContext<CombinedDataContextType | null>(null);

export const useCombinedDataContext = () => {
  const context = useContext(CombinedDataContext);
  if (!context) {
    throw new Error('useCombinedDataContext must be used within a CombinedDataProvider');
  }
  return context;
};

export const CombinedDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { registrations, calculatePaymentStatus } = useRegistrationsContext();
  const { seasons } = useSeasonsContext();
  const { products } = useProductsContext();
  const { participants } = useParticipantsContext();
  const { payments, getPaymentsByRegistration } = usePaymentsContext();

  // Get all registrations with additional details
  const getAllRegistrationsWithDetails = (): RegistrationWithDetails[] => {
    return registrations.map(registration => {
      const participant = participants.find(p => p.id === registration.participantId);
      const product = products.find(p => p.id === registration.productId);
      const season = product ? seasons.find(s => s.id === product.seasonId) : undefined;
      const paymentStatus = calculatePaymentStatus(registration);
      const registrationPayments = getPaymentsByRegistration(registration.id);

      return {
        ...registration,
        participant: participant!,
        product: product!,
        season: season!,
        paymentStatus,
        payments: registrationPayments,
      };
    }).filter(reg => reg.participant && reg.product && reg.season);
  };

  // Get daily activities
  const getDailyActivities = (date: string): any[] => {
    const dayOfWeek = new Date(date).getDay();
    const dayNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
    const currentDayName = dayNames[dayOfWeek];
    
    // Filter products that are active on the given date and have the current day in daysOfWeek
    const activeProducts = products.filter(product => {
      const isDateInRange = new Date(date) >= new Date(product.startDate) && 
                           new Date(date) <= new Date(product.endDate);
      
      // Check if product has the current day in its daysOfWeek array
      const isOnCurrentDay = !product.daysOfWeek || 
                           product.daysOfWeek.includes(currentDayName);
      
      return isDateInRange && isOnCurrentDay;
    });
    
    // Transform products to activities
    return activeProducts.map(product => {
      const numRegistrations = registrations.filter(r => r.productId === product.id).length;
      
      return {
        product,
        startTime: product.startTime || '00:00',
        dayOfWeek: currentDayName,
        numParticipants: numRegistrations,
        location: '-', // Default location if not specified
      };
    }).sort((a, b) => {
      // Sort by start time
      return a.startTime.localeCompare(b.startTime);
    });
  };

  const contextValue: CombinedDataContextType = {
    getAllRegistrationsWithDetails,
    getDailyActivities,
  };

  return (
    <CombinedDataContext.Provider value={contextValue}>
      {children}
    </CombinedDataContext.Provider>
  );
};
