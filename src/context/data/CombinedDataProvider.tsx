
import React, { createContext, useContext } from 'react';
import { CombinedDataContextType } from './types';
import { useSeasonsContext } from './SeasonsProvider';
import { useProductsContext } from './ProductsProvider';
import { useParticipantsContext } from './ParticipantsProvider';
import { useRegistrationsContext } from './RegistrationsProvider';
import { Participant, RegistrationWithDetails } from '@/types';

const CombinedDataContext = createContext<CombinedDataContextType | null>(null);

export const useCombinedDataContext = () => {
  const context = useContext(CombinedDataContext);
  if (!context) {
    throw new Error('useCombinedDataContext must be used within a CombinedDataProvider');
  }
  return context;
};

export const CombinedDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { seasons } = useSeasonsContext();
  const { products } = useProductsContext();
  const { participants } = useParticipantsContext();
  const { registrations, getRegistrationsByProduct, calculatePaymentStatus } = useRegistrationsContext();

  // Combined data functions
  const getRegistrationDetails = (productId: string): RegistrationWithDetails[] => {
    return getRegistrationsByProduct(productId).map(registration => {
      const participant = participants.find(p => p.id === registration.participantId) as Participant;
      const product = products.find(p => p.id === registration.productId);
      const season = product ? seasons.find(s => s.id === product.seasonId) : undefined;

      if (!participant || !product || !season) {
        console.error('Missing related data for registration', registration);
        return null;
      }

      return {
        ...registration,
        participant,
        product,
        season,
        paymentStatus: calculatePaymentStatus(registration)
      };
    }).filter(Boolean) as RegistrationWithDetails[];
  };

  const getAllRegistrationsWithDetails = (): RegistrationWithDetails[] => {
    return registrations.map(registration => {
      const participant = participants.find(p => p.id === registration.participantId);
      const product = products.find(p => p.id === registration.productId);
      const season = product ? seasons.find(s => s.id === product.seasonId) : undefined;

      if (!participant || !product || !season) {
        console.error('Missing related data for registration', registration);
        return null;
      }

      return {
        ...registration,
        participant,
        product,
        season,
        paymentStatus: calculatePaymentStatus(registration)
      };
    }).filter(Boolean) as RegistrationWithDetails[];
  };

  const getParticipantsByProduct = (productId: string): Participant[] => {
    const productRegistrations = getRegistrationsByProduct(productId);
    return productRegistrations.map(registration => {
      const participant = participants.find(p => p.id === registration.participantId);
      if (!participant) {
        console.error('Participant not found for registration', registration);
        return null;
      }
      return participant;
    }).filter(Boolean) as Participant[];
  };

  const contextValue: CombinedDataContextType = {
    getRegistrationDetails,
    getAllRegistrationsWithDetails,
    getParticipantsByProduct,
  };

  return (
    <CombinedDataContext.Provider value={contextValue}>
      {children}
    </CombinedDataContext.Provider>
  );
};
