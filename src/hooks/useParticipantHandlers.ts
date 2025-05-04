
import { Registration, Participant } from '@/types';
import { useAddParticipantHandler } from './participants/handlers/useAddParticipantHandler';
import { usePaymentHandlers } from './participants/handlers/usePaymentHandlers';
import { useHealthFormHandlers } from './participants/handlers/useHealthFormHandlers';

/**
 * Composition hook for all participant-related handlers
 */
export const useParticipantHandlers = (
  baseHandleOpenHealthForm: (registrationId: string) => void,
  baseHandleAddParticipant: (
    e: React.FormEvent, 
    newParticipant: any, 
    registrationData: any, 
    resetForm: () => void, 
    setIsAddParticipantOpen: (open: boolean) => void,
    getParticipantForRegistration: (registration: Registration) => Participant | undefined
  ) => any,
  baseHandleAddPayment: (
    e: React.FormEvent,
    newPayment: any,
    setIsAddPaymentOpen: (open: boolean) => void,
    setNewPayment: any,
    currentRegistration?: Registration | null
  ) => any,
  baseHandleApplyDiscount: (amount: number, setIsAddPaymentOpen: (open: boolean) => void, currentRegistration?: any) => any,
  newParticipant: any,
  registrationData: any,
  getParticipantForRegistration: (registration: Registration) => Participant | undefined,
  registrations: Registration[]
) => {
  const { handleOpenHealthForm } = useHealthFormHandlers(baseHandleOpenHealthForm);
  
  const { handleAddParticipant } = useAddParticipantHandler(
    baseHandleAddParticipant,
    newParticipant,
    registrationData,
    getParticipantForRegistration
  );
  
  const { handleAddPayment, handleApplyDiscount } = usePaymentHandlers(
    baseHandleAddPayment,
    baseHandleApplyDiscount
  );

  // Updated to ensure we explicitly pass currentRegistration through the entire chain
  const wrappedHandleAddPayment = (
    e: React.FormEvent,
    newPayment: any,
    setIsAddPaymentOpen: (open: boolean) => void,
    setNewPayment: any,
    currentRegistration?: Registration | null
  ) => {
    console.log("useParticipantHandlers wrappedHandleAddPayment called with currentRegistration:", currentRegistration);
    if (!currentRegistration) {
      console.warn("WARNING: No currentRegistration provided to useParticipantHandlers.wrappedHandleAddPayment");
    }
    return handleAddPayment(e, newPayment, setIsAddPaymentOpen, setNewPayment, currentRegistration);
  };

  const wrappedHandleApplyDiscount = (
    amount: number,
    setIsAddPaymentOpen: (open: boolean) => void,
    currentRegistration?: Registration | null
  ) => {
    console.log("useParticipantHandlers wrappedHandleApplyDiscount called with currentRegistration:", currentRegistration);
    if (!currentRegistration) {
      console.warn("WARNING: No currentRegistration provided to useParticipantHandlers.wrappedHandleApplyDiscount");
    }
    return handleApplyDiscount(amount, setIsAddPaymentOpen, currentRegistration);
  };

  return {
    handleOpenHealthForm,
    handleAddParticipant,
    handleAddPayment: wrappedHandleAddPayment,
    handleApplyDiscount: wrappedHandleApplyDiscount
  };
};
