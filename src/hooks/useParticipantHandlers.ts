
import { Registration, Participant } from '@/types';

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
    setNewPayment: any
  ) => any,
  baseHandleApplyDiscount: (amount: number, setIsAddPaymentOpen: (open: boolean) => void) => any,
  newParticipant: any,
  registrationData: any,
  getParticipantForRegistration: (registration: Registration) => Participant | undefined,
  registrations: Registration[]
) => {
  // Handler for opening health form - wrapper to pass required parameters
  const handleOpenHealthForm = (registrationId: string) => {
    return baseHandleOpenHealthForm(registrationId);
  };

  // Wrapper for handleAddParticipant
  const handleAddParticipant = (e: React.FormEvent, resetForm: () => void, setIsAddParticipantOpen: (open: boolean) => void) => {
    return baseHandleAddParticipant(
      e, 
      newParticipant, 
      registrationData, 
      resetForm, 
      setIsAddParticipantOpen,
      getParticipantForRegistration
    );
  };

  // Wrapper for handleAddPayment
  const handleAddPayment = (
    e: React.FormEvent, 
    newPayment: any,
    setIsAddPaymentOpen: (open: boolean) => void,
    setNewPayment: any
  ) => {
    return baseHandleAddPayment(
      e,
      newPayment,
      setIsAddPaymentOpen,
      setNewPayment
    );
  };

  // Adapter for handleApplyDiscount to match expected signature in AddPaymentDialog
  const handleApplyDiscountAdapter = (amount: number, setIsAddPaymentOpen: (open: boolean) => void) => {
    return baseHandleApplyDiscount(amount, setIsAddPaymentOpen);
  };

  return {
    handleOpenHealthForm,
    handleAddParticipant,
    handleAddPayment,
    handleApplyDiscount: handleApplyDiscountAdapter
  };
};
