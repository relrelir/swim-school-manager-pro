import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from "@/components/ui/use-toast";
import { Season, Product, Participant, Registration, Payment } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { handleSupabaseError } from './utils';

// Import from our providers
import { SeasonsProvider, useSeasonsContext } from './data/SeasonsProvider';
import { ProductsProvider, useProductsContext } from './data/ProductsProvider';
import { ParticipantsProvider, useParticipantsContext } from './data/ParticipantsProvider';
import { RegistrationsProvider, useRegistrationsContext } from './data/RegistrationsProvider';
import { PaymentsProvider, usePaymentsContext } from './data/PaymentsProvider';

// Create the combined context
const DataContext = createContext({});

export const useData = () => {
  return useContext(DataContext);
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  
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

// This component combines all contexts into a single provider
const CombinedDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Get data and methods from all contexts
  const seasonsContext = useSeasonsContext();
  const productsContext = useProductsContext();
  const participantsContext = useParticipantsContext();
  const registrationsContext = useRegistrationsContext();
  const paymentsContext = usePaymentsContext();

  // Combine all context values
  const combinedContextValue = {
    ...seasonsContext,
    ...productsContext,
    ...participantsContext,
    ...registrationsContext,
    ...paymentsContext,
  };
  
  return (
    <DataContext.Provider value={combinedContextValue}>
      {children}
    </DataContext.Provider>
  );
};
