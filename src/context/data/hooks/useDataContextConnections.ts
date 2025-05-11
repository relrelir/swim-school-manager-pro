
import { useContext } from 'react';
import { useSeasonsContext } from '../SeasonsProvider';
import { useProducts } from '@/hooks/useProducts';
import { useParticipantsContext } from '../ParticipantsProvider';
import { useRegistrations } from '@/hooks/useRegistrations';
import { usePayments } from '@/hooks/usePayments';
import { useHealthDeclarations } from '@/hooks/useHealthDeclarations';
import { usePoolsContext } from '../pools/usePoolsContext';

export const useDataContextConnections = () => {
  // Get context data from each provider
  const { seasons, addSeason, updateSeason, deleteSeason, loading: seasonsLoading } = useSeasonsContext();
  
  // Products context
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
  
  // Get participant context data
  const { 
    participants,
    addParticipant,
    updateParticipant,
    deleteParticipant,
    loading: participantsLoading 
  } = useParticipantsContext();
  
  // Registrations context
  const { 
    registrations, 
    addRegistration, 
    updateRegistration, 
    deleteRegistration, 
    getRegistrationsByProduct, 
    loading: registrationsLoading 
  } = useRegistrations();
  
  // Payments context
  const { 
    payments, 
    addPayment, 
    updatePayment, 
    deletePayment, 
    getPaymentsByRegistration, 
    loading: paymentsLoading 
  } = usePayments();
  
  // Health declarations context
  const healthContext = useHealthDeclarations();
  const { 
    healthDeclarations, 
    updateHealthDeclaration, 
    addHealthDeclaration,
    loading: healthDeclarationsLoading 
  } = healthContext;
  
  // Pools context
  const { 
    pools, 
    getPoolsBySeason, 
    addPool, 
    updatePool, 
    deletePool, 
    loading: poolsLoading 
  } = usePoolsContext();
  
  // Calculate overall loading state
  const loading = seasonsLoading || 
                  productsLoading || 
                  participantsLoading || 
                  registrationsLoading || 
                  paymentsLoading || 
                  healthDeclarationsLoading || 
                  poolsLoading;

  return {
    seasons,
    products,
    participants,
    registrations,
    payments,
    healthDeclarations,
    pools,
    addSeason,
    updateSeason,
    deleteSeason,
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
  };
};
