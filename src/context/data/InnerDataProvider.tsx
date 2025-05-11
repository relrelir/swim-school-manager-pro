
import React from 'react';
import { DataContextProps } from './types/dataContextTypes';
import DataContext from '@/context/DataContext';
import { useDataContextConnections } from './hooks/useDataContextConnections';
import {
  getRegistrationsByParticipant,
  getHealthDeclarationByParticipant,
  getPoolById,
  buildAllRegistrationsWithDetails,
  calculateMeetingProgress,
  getDailyActivities
} from './utils/dataUtils';
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
  // Get all context connections
  const {
    seasons,
    products,
    participants,
    registrations,
    payments,
    healthDeclarations,
    pools,
    addSeason,
    updateSeason,
    deleteSeason: deleteSeasonContext,
    addProduct,
    updateProduct,
    deleteProduct,
    addParticipant,
    updateParticipant,
    deleteParticipant,
    addRegistration,
    updateRegistration,
    deleteRegistration,
    addPayment,
    updatePayment,
    deletePayment,
    updateHealthDeclaration,
    addHealthDeclaration,
    getRegistrationsByProduct,
    getPaymentsByRegistration,
    getProductsBySeason,
    getProductsByPool,
    getPoolsBySeason,
    addPool,
    updatePool,
    deletePool,
    loading
  } = useDataContextConnections();

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
    getRegistrationsByParticipant: (participantId: string) => getRegistrationsByParticipant(registrations, participantId),
    getAllRegistrationsWithDetails: () => buildAllRegistrationsWithDetails(
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
    getHealthDeclarationByParticipant: (participantId: string) => getHealthDeclarationByParticipant(healthDeclarations, participantId),
    getPoolsBySeason,
    getPoolById: (id: string) => getPoolById(pools, id),
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
