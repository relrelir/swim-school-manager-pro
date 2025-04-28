
import React, { createContext, useContext, useMemo } from 'react';
import { SeasonsProvider, useSeasonsContext } from './data/SeasonsProvider';
import { ProductsProvider, useProductsContext } from './data/ProductsProvider';
import { ParticipantsProvider, useParticipantsContext } from './data/ParticipantsProvider';
import { RegistrationsProvider, useRegistrationsContext } from './data/RegistrationsProvider';
import { PaymentsProvider, usePaymentsContext } from './data/PaymentsProvider';
import { CombinedDataContextType } from './data/types';
import { calculateCurrentMeeting } from './data/utils';
import { Product } from '@/types';

// Create the context
const DataContext = createContext<CombinedDataContextType | null>(null);

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

  const getAllRegistrationsWithDetails = () => {
    return registrationsContext.registrations.map(registration => {
      const product = productsContext.products.find(p => p.id === registration.productId);
      const participant = participantsContext.participants.find(p => p.id === registration.participantId);
      const payments = paymentsContext.payments.filter(p => p.registrationId === registration.id);
      const season = product ? seasonsContext.seasons.find(s => s.id === product.seasonId) : undefined;
      const paymentStatus = registrationsContext.calculatePaymentStatus(registration);

      return {
        ...registration,
        product,
        participant,
        season,
        payments,
        paymentStatus
      };
    }).filter(r => r.product && r.participant && r.season);
  };

  const calculateMeetingProgress = (product: Product) => {
    return calculateCurrentMeeting(product);
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
      calculateMeetingProgress
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
