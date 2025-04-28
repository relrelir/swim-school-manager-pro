
import React from 'react';
import { SeasonsProvider } from './SeasonsProvider';
import { ProductsProvider } from './ProductsProvider';
import { ParticipantsProvider } from './ParticipantsProvider';
import { RegistrationsProvider } from './RegistrationsProvider';
import { CombinedDataProvider } from './CombinedDataProvider';
import { DataContext } from '../DataContext';
import { useRegistrationsContext } from './RegistrationsProvider';
import { useSeasonsContext } from './SeasonsProvider';
import { useProductsContext } from './ProductsProvider';
import { useParticipantsContext } from './ParticipantsProvider';
import { useCombinedDataContext } from './CombinedDataProvider';

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <SeasonsProvider>
      <RegistrationsProvider>
        {(registrationsContext) => (
          <ProductsProvider registrations={registrationsContext.registrations}>
            <ParticipantsProvider registrations={registrationsContext.registrations}>
              <CombinedDataProvider>
                <DataProviderCombiner>
                  {children}
                </DataProviderCombiner>
              </CombinedDataProvider>
            </ParticipantsProvider>
          </ProductsProvider>
        )}
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
  const combinedDataContext = useCombinedDataContext();

  const combinedContext = {
    ...seasonsContext,
    ...productsContext,
    ...participantsContext,
    ...registrationsContext,
    ...combinedDataContext,
  };

  return (
    <DataContext.Provider value={combinedContext}>
      {children}
    </DataContext.Provider>
  );
};
