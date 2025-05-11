
import React, { createContext, useContext } from 'react';
import { SeasonsProvider } from './data/SeasonsProvider';
import { ProductsProvider } from './data/ProductsProvider';
import { ParticipantsProvider } from './data/ParticipantsProvider';
import { RegistrationsProvider } from './data/RegistrationsProvider';
import { PaymentsProvider } from './data/PaymentsProvider';
import { HealthDeclarationsProvider } from './data/HealthDeclarationsProvider';
import { PoolsProvider } from './data/PoolsProvider';
import InnerDataProvider from './data/InnerDataProvider';
import { DataContextProps } from './data/types/dataContextTypes';

// Create the context
const DataContext = createContext<DataContextProps | null>(null);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

// Main provider that wraps all other providers
export const DataProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  return (
    <SeasonsProvider>
      <ProductsProvider>
        <ParticipantsProvider>
          <RegistrationsProvider>
            <PaymentsProvider>
              <HealthDeclarationsProvider>
                <PoolsProvider>
                  <InnerDataProvider>
                    {children}
                  </InnerDataProvider>
                </PoolsProvider>
              </HealthDeclarationsProvider>
            </PaymentsProvider>
          </RegistrationsProvider>
        </ParticipantsProvider>
      </ProductsProvider>
    </SeasonsProvider>
  );
};

export default DataContext;
