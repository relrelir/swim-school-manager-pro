
import React from 'react';
import { DataContextProps } from './types/dataContextTypes';
import DataContext from '@/context/DataContext';
import { useSeasonsContext } from './SeasonsProvider';
import { useProducts } from '@/hooks/useProducts';
import { useParticipantsContext } from './ParticipantsProvider';
import { useRegistrations } from '@/hooks/useRegistrations';
import { usePayments } from '@/hooks/usePayments';
import { useHealthDeclarations } from '@/hooks/useHealthDeclarations';
import { usePoolsContext } from './pools/usePoolsContext';
import { calculateMeetingProgress, getDailyActivities } from '@/utils/activityUtils';
import { getAllRegistrationsWithDetails } from '@/utils/registrationUtils';
import {
  promisifyAddProduct,
  promisifyUpdateSeason,
  promisifyDeleteSeason,
  promisifyAddParticipant,
  promisifyUpdateParticipant,
  promisifyDeleteParticipant,
  promisifyUpdateRegistration,
  promisifyDeleteRegistration,
  promisifyUpdatePayment,
  promisifyDeletePayment,
  promisifyUpdateHealthDeclaration
} from './utils/promiseWrappers';

// Create an inner provider that depends on the outer providers
const InnerDataProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  // Inside this component, we can safely use all the hooks that depend on the outer providers
  const { seasons, addSeason, updateSeason, deleteSeason: deleteSeasonContext, loading: seasonsLoading } = useSeasonsContext();
  
  // Explicitly define the type for useProducts
  const productsContext = useProducts();
  const { 
    products, 
    addProduct, 
    updateProduct, 
    deleteProduct, 
    getProductsBySeason, 
    getProductsByPool,
    loading: productsLoading 
  } = productsContext;
  
  // Get participant context data directly from the context
  const { 
    participants,
    addParticipant,
    updateParticipant,
    deleteParticipant,
    loading: participantsLoading 
  } = useParticipantsContext();
  
  const { registrations, addRegistration, updateRegistration, deleteRegistration, getRegistrationsByProduct, loading: registrationsLoading } = useRegistrations();
  const { payments, addPayment, updatePayment, deletePayment, getPaymentsByRegistration, loading: paymentsLoading } = usePayments();
  
  // Explicitly define the type for useHealthDeclarations
  const healthContext = useHealthDeclarations();
  const { 
    healthDeclarations, 
    updateHealthDeclaration, 
    addHealthDeclaration,
    loading: healthDeclarationsLoading 
  } = healthContext;
  
  const { pools, getPoolsBySeason, addPool, updatePool, deletePool, loading: poolsLoading } = usePoolsContext();
  const loading = seasonsLoading || productsLoading || participantsLoading || registrationsLoading || paymentsLoading || healthDeclarationsLoading || poolsLoading;

  // Get registrations by participant
  const getRegistrationsByParticipant = (participantId: string) => {
    return registrations.filter(registration => registration.participantId === participantId);
  };

  // Get health declaration by participant
  const getHealthDeclarationByParticipant = (participantId: string) => {
    return healthDeclarations.find(healthDeclaration => healthDeclaration.participant_id === participantId);
  };

  // Get pool by ID
  const getPoolById = (id: string) => {
    return pools.find(pool => pool.id === id);
  };

  const contextValue: DataContextProps = {
    seasons,
    products,
    pools,
    participants,
    registrations,
    payments,
    healthDeclarations,
    addProduct: promisifyAddProduct(addProduct),
    updateProduct,
    deleteProduct,
    addSeason,
    updateSeason: promisifyUpdateSeason(updateSeason),
    deleteSeason: promisifyDeleteSeason(deleteSeasonContext),
    addParticipant: promisifyAddParticipant(addParticipant),
    updateParticipant: promisifyUpdateParticipant(updateParticipant),
    deleteParticipant: promisifyDeleteParticipant(deleteParticipant),
    addRegistration,
    updateRegistration: promisifyUpdateRegistration(updateRegistration),
    deleteRegistration: promisifyDeleteRegistration(deleteRegistration),
    addPayment,
    updatePayment: promisifyUpdatePayment(updatePayment),
    deletePayment: promisifyDeletePayment(deletePayment),
    updateHealthDeclaration: promisifyUpdateHealthDeclaration(updateHealthDeclaration),
    addHealthDeclaration,
    getRegistrationsByProduct,
    getRegistrationsByParticipant,
    getAllRegistrationsWithDetails: () => getAllRegistrationsWithDetails(
      registrations, 
      participants, 
      products, 
      seasons,
      payments,
      getPaymentsByRegistration
    ),
    getPaymentsByRegistration,
    getProductsBySeason,
    getProductsByPool,
    getHealthDeclarationByParticipant,
    getPoolsBySeason,
    getPoolById,
    getDailyActivities: (date: string) => getDailyActivities(date, products, getRegistrationsByProduct),
    calculateMeetingProgress,
    addPool,
    updatePool,
    deletePool,
    loading,
  };

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
};

export default InnerDataProvider;
