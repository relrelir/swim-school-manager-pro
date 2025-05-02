
import { Participant, Registration } from '@/types';
import { useActionAdapters } from './useActionAdapters';
import { useHealthFormAdapters } from './useHealthFormAdapters';
import { usePaymentAdapters } from './usePaymentAdapters';

/**
 * Composition hook for all adapter hooks
 */
export const useParticipantAdapters = (
  updateParticipant: (participant: Participant) => void,
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
    setNewPayment: any
  ) => any,
  baseHandleApplyDiscount: (amount: number, setIsAddPaymentOpen: (open: boolean) => void) => any
) => {
  const { adaptedUpdateParticipant } = useActionAdapters(updateParticipant);
  const { adaptedHandleOpenHealthForm } = useHealthFormAdapters(baseHandleOpenHealthForm);
  const { handleAddPaymentWrapper, handleApplyDiscountAdapter } = usePaymentAdapters(
    baseHandleAddPayment,
    baseHandleApplyDiscount
  );

  const handleAddParticipantWrapper = (
    e: React.FormEvent, 
    newParticipant: any, 
    registrationData: any, 
    resetForm: () => void, 
    setIsAddParticipantOpen: (open: boolean) => void,
    getParticipantForRegistration: (registration: Registration) => Participant | undefined
  ) => {
    return baseHandleAddParticipant(e, newParticipant, registrationData, resetForm, setIsAddParticipantOpen, getParticipantForRegistration);
  };

  return {
    adaptedUpdateParticipant,
    adaptedHandleOpenHealthForm,
    handleAddParticipantWrapper,
    handleAddPaymentWrapper,
    handleApplyDiscountAdapter
  };
};
