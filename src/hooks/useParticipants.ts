
import { useParams } from 'react-router-dom';
import { useData } from '@/context/DataContext';
import { Registration } from '@/types';
import { useParticipantsState } from './participants/useParticipantsState';
import { useParticipantCalculations } from './participants/useParticipantCalculations';
import { useParticipantHandlers } from './participants/useParticipantHandlers';
import { useParticipantUtils } from './useParticipantUtils';
import { useParticipantsContext } from '@/context/data/ParticipantsProvider';

/**
 * Main hook for participants management - composing smaller, focused hooks
 */
export const useParticipants = () => {
  const { productId } = useParams<{ productId: string }>();
  const dataContext = useData();
  
  // Get participants context directly for participant operations
  const { 
    participants: allParticipants, 
    addParticipant,
    updateParticipant,
    deleteParticipant,
    loading: participantsLoading
  } = useParticipantsContext();

  // Get the current product
  const product = dataContext.products.find(p => p.id === productId);
  
  // Get registrations for the current product
  const registrations = productId ? dataContext.getRegistrationsByProduct(productId) : [];
  
  // Get participants for the current registrations
  const participants = registrations
    .map(registration => {
      return allParticipants.find(p => p.id === registration.participantId);
    })
    .filter(Boolean);

  // Initialize the state
  const stateHook = useParticipantsState(product?.price);
  
  // Get utility functions
  const { 
    getParticipantForRegistration, 
    getPaymentsForRegistration, 
    getStatusClassName 
  } = useParticipantUtils(
    allParticipants, 
    dataContext.payments
  );

  // Get calculations
  const { 
    totalParticipants, 
    totalExpected, 
    totalPaid, 
    isCalculating, // Make sure to extract isCalculating
    calculatePaymentStatus 
  } = useParticipantCalculations(
    registrations,
    participants,
    dataContext.payments,
    dataContext.getPaymentsByRegistration
  );

  // Get handlers
  const { 
    handleAddParticipant,
    handleAddPayment,
    handleDeleteRegistration,
    handleUpdateHealthApproval,
    handleOpenHealthForm,
    handleApplyDiscount
  } = useParticipantHandlers(
    productId,
    dataContext,
    stateHook.setIsAddParticipantOpen,
    stateHook.setIsAddPaymentOpen,
    stateHook.setRefreshTrigger,
    stateHook.resetForm,
    stateHook.currentRegistration,
    stateHook.newParticipant,
    stateHook.registrationData,
    stateHook.newPayment,
    stateHook.setCurrentHealthDeclaration,
    stateHook.setNewPayment,
    addParticipant,
    updateParticipant
  );

  // Calculate registrationsFilled metric
  const registrationsFilled = product?.maxParticipants ? 
    Math.min(1, totalParticipants / product.maxParticipants) : 0;
  
  // Get health declarations for registrations
  const getHealthDeclarationForRegistration = dataContext.getHealthDeclarationForRegistration;

  return {
    // Core data
    product,
    registrations,
    participants,
    loading: participantsLoading || !productId,

    // State from useParticipantsState
    ...stateHook,

    // Calculations
    totalParticipants,
    totalExpected,
    totalPaid,
    registrationsFilled,
    isCalculating, // Include isCalculating in return
    
    // Utility functions
    getParticipantForRegistration,
    getPaymentsForRegistration,
    getStatusClassName,
    calculatePaymentStatus,
    getHealthDeclarationForRegistration,
    
    // Handlers
    handleAddParticipant,
    handleAddPayment,
    handleDeleteRegistration,
    handleUpdateHealthApproval,
    handleOpenHealthForm,
    handleApplyDiscount,
    
    // Participant operations from context
    addParticipant,
    updateParticipant,
    deleteParticipant
  };
};
