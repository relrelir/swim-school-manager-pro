
import React, { useContext } from 'react';
import { SeasonsProvider, useSeasonsContext } from './data/SeasonsProvider';
import { ProductsProvider, useProductsContext } from './data/ProductsProvider';
import { ParticipantsProvider, useParticipantsContext } from './data/ParticipantsProvider';
import { RegistrationsProvider, useRegistrationsContext } from './data/RegistrationsProvider';
import { PaymentsProvider, usePaymentsContext } from './data/PaymentsProvider';
import { HealthDeclarationsProvider, useHealthDeclarationsContext } from './data/HealthDeclarationsProvider';
import { CombinedDataContextType } from './data/types';
import { Product } from '@/types';

// Custom hook to access the combined data context
export const useData = () => {
  const seasonsContext = useSeasonsContext();
  const productsContext = useProductsContext();
  const participantsContext = useParticipantsContext();
  const registrationsContext = useRegistrationsContext();
  const paymentsContext = usePaymentsContext();
  const healthDeclarationsContext = useHealthDeclarationsContext();

  // Function to get all registrations with additional details
  const getAllRegistrationsWithDetails = () => {
    const { registrations } = registrationsContext;
    const { products } = productsContext;
    const { seasons } = seasonsContext;
    const { participants } = participantsContext;
    const { payments } = paymentsContext;

    return registrations.map(registration => {
      const product = products.find(p => p.id === registration.productId);
      const participant = participants.find(p => p.id === registration.participantId);
      const season = product ? seasons.find(s => s.id === product.seasonId) : undefined;
      const registrationPayments = payments.filter(p => p.registrationId === registration.id);
      const paymentStatus = registrationsContext.calculatePaymentStatus(registration);

      return {
        ...registration,
        product: product!,
        participant: participant!,
        season: season!,
        paymentStatus,
        payments: registrationPayments
      };
    }).filter(reg => reg.product && reg.participant && reg.season);
  };

  // Calculate meeting progress for a product
  const calculateMeetingProgress = (product: Product) => {
    // If the product is missing necessary fields, return default values
    if (!product.startDate || !product.meetingsCount || !product.daysOfWeek || product.daysOfWeek.length === 0) {
      return { current: 0, total: product.meetingsCount || 10 };
    }

    const startDate = new Date(product.startDate);
    const today = new Date();
    
    // If today is before the start date, return 0
    if (today < startDate) {
      return { current: 0, total: product.meetingsCount };
    }

    // Map Hebrew days to JS day numbers (0 = Sunday, 6 = Saturday)
    const dayMap: { [key: string]: number } = {
      'ראשון': 0,
      'שני': 1,
      'שלישי': 2,
      'רביעי': 3,
      'חמישי': 4,
      'שישי': 5,
      'שבת': 6
    };
    
    // Convert Hebrew days to JS day numbers
    const activityDays = product.daysOfWeek.map(day => dayMap[day]).sort();
    
    let meetingCount = 0;
    let currentDate = new Date(startDate);
    
    // Count meetings until today
    while (currentDate <= today) {
      const dayOfWeek = currentDate.getDay();
      
      if (activityDays.includes(dayOfWeek)) {
        meetingCount++;
        
        // If we've counted all meetings, stop
        if (meetingCount >= product.meetingsCount) {
          break;
        }
      }
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return { 
      current: Math.min(meetingCount, product.meetingsCount), 
      total: product.meetingsCount 
    };
  };

  // Function to get daily activities for a specific date
  const getDailyActivities = (date: string) => {
    const selectedDate = new Date(date);
    const dayOfWeekNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
    const dayOfWeek = dayOfWeekNames[selectedDate.getDay()];
    
    // Get products active on this date and day of week
    const activeProducts = productsContext.products.filter(product => {
      // Check if product is active on this date
      const productStartDate = new Date(product.startDate);
      const productEndDate = new Date(product.endDate);
      
      // Check if selected date is between product start and end dates
      const isDateInRange = selectedDate >= productStartDate && selectedDate <= productEndDate;
      
      // Check if product runs on this day of the week
      const isOnDayOfWeek = product.daysOfWeek?.includes(dayOfWeek);
      
      return isDateInRange && isOnDayOfWeek;
    });
    
    return activeProducts.map(product => {
      // Count registrations for this product
      const productRegistrations = registrationsContext.getRegistrationsByProduct(product.id);
      
      // Calculate meeting number
      const progress = calculateMeetingProgress(product);
      
      return {
        product,
        startTime: product.startTime,
        numParticipants: productRegistrations.length,
        currentMeetingNumber: progress.current,
        totalMeetings: progress.total
      };
    });
  };

  return {
    // Spread all individual contexts
    ...seasonsContext,
    ...productsContext,
    ...participantsContext,
    ...registrationsContext,
    ...paymentsContext,
    ...healthDeclarationsContext,
    
    // Add combined functions
    getAllRegistrationsWithDetails,
    calculateMeetingProgress,
    getDailyActivities
  };
};

// Main data provider component
export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <SeasonsProvider>
      <ProductsProvider>
        <ParticipantsProvider>
          <RegistrationsProvider>
            <PaymentsProvider>
              <HealthDeclarationsProvider>
                {children}
              </HealthDeclarationsProvider>
            </PaymentsProvider>
          </RegistrationsProvider>
        </ParticipantsProvider>
      </ProductsProvider>
    </SeasonsProvider>
  );
};
