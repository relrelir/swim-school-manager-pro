
import { Participant, Registration } from '@/types';

/**
 * Hook for creating adapter functions to bridge function signature differences
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
  baseHandleApplyDiscount: (amount: number, setIsAddPaymentOpen: (open: boolean) => void, registrationId?: string) => any
) => {
  // Create an adapter for updateParticipant to match the expected signature
  const adaptedUpdateParticipant = async (id: string, data: Partial<Participant>): Promise<Participant> => {
    // Create a participant object that satisfies the Participant type
    const participantToUpdate = {
      id,
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      phone: data.phone || '',
      healthApproval: data.healthApproval !== undefined ? data.healthApproval : false,
      idNumber: data.idNumber || '',
      ...data
    } as Participant;
    
    await updateParticipant(participantToUpdate);
    return participantToUpdate;
  };

  // Create an adapter for handleOpenHealthForm
  const adaptedHandleOpenHealthForm = (registrationId: string) => {
    return baseHandleOpenHealthForm(registrationId);
  };

  // Handler wrappers for participant, payment, and discount operations
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

  const handleAddPaymentWrapper = (
    e: React.FormEvent, 
    newPayment: any,
    setIsAddPaymentOpen: (open: boolean) => void,
    setNewPayment: any
  ) => {
    return baseHandleAddPayment(e, newPayment, setIsAddPaymentOpen, setNewPayment);
  };

  // Update the adapter to accept registrationId
  const handleApplyDiscountAdapter = (amount: number, setIsAddPaymentOpen: (open: boolean) => void, registrationId?: string) => {
    return baseHandleApplyDiscount(amount, setIsAddPaymentOpen, registrationId);
  };

  return {
    adaptedUpdateParticipant,
    adaptedHandleOpenHealthForm,
    handleAddParticipantWrapper,
    handleAddPaymentWrapper,
    handleApplyDiscountAdapter
  };
};
