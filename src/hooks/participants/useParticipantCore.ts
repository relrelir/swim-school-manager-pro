
import { useState, useEffect } from 'react';
import { Registration, Participant, HealthDeclaration, PaymentStatus } from '@/types';
import { useParticipantUtils } from '../useParticipantUtils';
import { useParticipantEffects } from '../useParticipantEffects';
import { useParticipantState } from '../useParticipantState';
import { useSummaryCalculations } from '../useSummaryCalculations';

/**
 * Core hook for participant data and state management
 */
export const useParticipantCore = (
  productId: string | undefined,
  dataContext: any
) => {
  const { 
    products, 
    participants, 
    getRegistrationsByProduct, 
    payments,
    calculatePaymentStatus,
    getHealthDeclarationForRegistration
  } = dataContext;
  
  const [loading, setLoading] = useState(true);

  // Import participant utilities
  const {
    getParticipantForRegistration,
    getPaymentsForRegistration,
    getStatusClassName
  } = useParticipantUtils(participants, payments);

  // Load product and registration data via effects
  const {
    product,
    registrations,
    refreshTrigger,
    setRefreshTrigger,
    totalParticipants,
    registrationsFilled,
    totalExpected,
    totalPaid
  } = useParticipantEffects(productId, products, undefined, getRegistrationsByProduct);
  
  // Set loading to false when product and registrations are loaded
  useEffect(() => {
    if (product) {
      setLoading(false);
    }
  }, [product, registrations]);

  // Import participant state management
  const {
    isAddParticipantOpen,
    setIsAddParticipantOpen,
    isAddPaymentOpen,
    setIsAddPaymentOpen,
    isLinkDialogOpen,
    setIsLinkDialogOpen,
    currentRegistration,
    setCurrentRegistration,
    currentHealthDeclaration,
    setCurrentHealthDeclaration,
    newParticipant,
    setNewParticipant,
    registrationData,
    setRegistrationData,
    newPayment,
    setNewPayment,
    resetForm
  } = useParticipantState(product);

  return {
    // Data
    participants,
    product,
    registrations,
    refreshTrigger,
    setRefreshTrigger,
    totalParticipants,
    registrationsFilled, 
    totalExpected,
    totalPaid,
    loading,

    // State
    isAddParticipantOpen,
    setIsAddParticipantOpen,
    isAddPaymentOpen,
    setIsAddPaymentOpen,
    isLinkDialogOpen,
    setIsLinkDialogOpen,
    currentRegistration,
    setCurrentRegistration,
    currentHealthDeclaration,
    setCurrentHealthDeclaration,
    newParticipant,
    setNewParticipant,
    registrationData,
    setRegistrationData,
    newPayment,
    setNewPayment,
    
    // Functions
    resetForm,
    getParticipantForRegistration,
    getPaymentsForRegistration,
    getStatusClassName,
    calculatePaymentStatus,
    getHealthDeclarationForRegistration
  };
};
