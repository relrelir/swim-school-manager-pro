
import React, { createContext, useContext, useMemo } from 'react';
import { SeasonsProvider, useSeasonsContext } from './data/SeasonsProvider';
import { ProductsProvider, useProductsContext } from './data/ProductsProvider';
import { ParticipantsProvider, useParticipantsContext } from './data/ParticipantsProvider';
import { RegistrationsProvider, useRegistrationsContext } from './data/RegistrationsProvider';
import { PaymentsProvider, usePaymentsContext } from './data/PaymentsProvider';
import { CombinedDataContextType } from './data/types';
import { calculateCurrentMeeting } from './data/utils';
import { Product, DailyActivity, Payment } from '@/types';
import { format, isWithinInterval } from 'date-fns';

// Create the context
export const DataContext = createContext<CombinedDataContextType | null>(null);

// Custom hook to use the data context
export const useData = () => {
  const context = useContext(DataContext);
  if (context === null) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

// Custom provider that combines all the data providers
export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <SeasonsProvider>
      <ProductsProvider>
        <ParticipantsProvider>
          <RegistrationsProvider>
            <PaymentsProvider>
              <CombinedDataProvider>
                {children}
              </CombinedDataProvider>
            </PaymentsProvider>
          </RegistrationsProvider>
        </ParticipantsProvider>
      </ProductsProvider>
    </SeasonsProvider>
  );
};

// Combined data provider component
const CombinedDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const seasonsContext = useSeasonsContext();
  const productsContext = useProductsContext();
  const participantsContext = useParticipantsContext();
  const registrationsContext = useRegistrationsContext();
  const paymentsContext = usePaymentsContext();

  // Calculate total paid amount without discounts
  const calculateActualPaidAmount = (registrationId: string): number => {
    const registrationPayments = paymentsContext.payments.filter(p => p.registrationId === registrationId);
    const actualPayments = registrationPayments.filter(p => p.receiptNumber !== '');
    return actualPayments.reduce((total, payment) => total + payment.amount, 0);
  };

  // Calculate discount amount
  const calculateDiscountAmount = (registrationId: string): number => {
    const registration = registrationsContext.registrations.find(r => r.id === registrationId);
    if (!registration || !registration.discountApproved) return 0;
    
    return registration.discountAmount || 0;
  };

  // Utility function to get all registrations with their details
  const getAllRegistrationsWithDetails = () => {
    return registrationsContext.registrations.map(registration => {
      const product = productsContext.products.find(p => p.id === registration.productId);
      const participant = participantsContext.participants.find(p => p.id === registration.participantId);
      const payments = paymentsContext.payments.filter(p => p.registrationId === registration.id);
      const season = product ? seasonsContext.seasons.find(s => s.id === product.seasonId) : undefined;
      
      // Calculate actual paid amount (excluding discounts)
      const actualPaidAmount = calculateActualPaidAmount(registration.id);
      const paymentStatus = registrationsContext.calculatePaymentStatus(registration, actualPaidAmount);

      return {
        ...registration,
        product,
        participant,
        season,
        payments,
        paymentStatus,
        actualPaidAmount
      };
    }).filter(r => r.product && r.participant && r.season);
  };

  // Calculate the progress of meetings for a product
  const calculateMeetingProgress = (product: Product) => {
    return calculateCurrentMeeting(product);
  };

  // Get daily activities for a specific date
  const getDailyActivities = (date: string): DailyActivity[] => {
    // Filter products that are active on the selected date
    const activeProducts = productsContext.products.filter(product => {
      const productStartDate = new Date(product.startDate);
      const productEndDate = new Date(product.endDate);
      const selectedDate = new Date(date);
      
      // Check if the selected date is within the product's date range
      const isInDateRange = isWithinInterval(selectedDate, {
        start: productStartDate,
        end: productEndDate
      });
      
      if (!isInDateRange) {
        return false;
      }
      
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
        return isActiveDay;
      }
      
      // For products without specific days, just check if the date is within range
      return true;
    });
    
    // Map to the required structure with participant count and meeting info
    return activeProducts.map(product => {
      const productRegistrations = registrationsContext.getRegistrationsByProduct(product.id);
      const meetingInfo = calculateCurrentMeeting(product);
      
      return {
        startTime: product.startTime,
        product,
        numParticipants: productRegistrations.length,
        currentMeetingNumber: meetingInfo.current,
        totalMeetings: meetingInfo.total
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

  // Combine all context values
  const combinedContextValue = useMemo(
    () => ({
      ...seasonsContext,
      ...productsContext,
      ...participantsContext,
      ...registrationsContext,
      ...paymentsContext,
      getAllRegistrationsWithDetails,
      calculateMeetingProgress,
      getDailyActivities,
      calculateActualPaidAmount,
      calculateDiscountAmount
    }),
    [
      seasonsContext,
      productsContext,
      participantsContext,
      registrationsContext,
      paymentsContext
    ]
  );

  return (
    <DataContext.Provider value={combinedContextValue}>
      {children}
    </DataContext.Provider>
  );
};
