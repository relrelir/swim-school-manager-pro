
import React from 'react';
import { SeasonsProvider } from './SeasonsProvider';
import { ProductsProvider } from './ProductsProvider';
import { ParticipantsProvider } from './ParticipantsProvider';
import { RegistrationsProvider } from './RegistrationsProvider';
import { PaymentsProvider } from './PaymentsProvider';
import { CombinedDataProvider } from './CombinedDataProvider';
import { DataContext } from '../DataContext';
import { useRegistrationsContext } from './RegistrationsProvider';
import { useSeasonsContext } from './SeasonsProvider';
import { useProductsContext } from './ProductsProvider';
import { useParticipantsContext } from './ParticipantsProvider';
import { usePaymentsContext } from './PaymentsProvider';
import { useCombinedDataContext } from './CombinedDataProvider';

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <SeasonsProvider>
      <RegistrationsProvider>
        <ProductsProvider>
          <ParticipantsProvider>
            <PaymentsProvider>
              <CombinedDataProvider>
                <DataProviderCombiner>
                  {children}
                </DataProviderCombiner>
              </CombinedDataProvider>
            </PaymentsProvider>
          </ParticipantsProvider>
        </ProductsProvider>
      </RegistrationsProvider>
    </SeasonsProvider>
  );
};

// Combines all contexts into one DataContext
const DataProviderCombiner: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const seasonsContext = useSeasonsContext();
  const productsContext = useProductsContext();
  const participantsContext = useParticipantsContext();
  const registrationsContext = useRegistrationsContext();
  const paymentsContext = usePaymentsContext();
  const combinedDataContext = useCombinedDataContext();

  const combinedContext = {
    ...seasonsContext,
    ...productsContext,
    ...participantsContext,
    ...registrationsContext,
    ...paymentsContext,
    ...combinedDataContext,
  };

  return (
    <DataContext.Provider value={combinedContext}>
      {children}
    </DataContext.Provider>
  );
};
