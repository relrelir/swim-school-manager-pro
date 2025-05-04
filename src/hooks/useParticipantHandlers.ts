
import { Registration, Participant } from '@/types';

export const useParticipantHandlers = (
  handleOpenHealthForm: ((registrationId: string) => void) | null,
  baseHandleAddParticipant: any,
  baseHandleAddPayment: any, 
  baseHandleApplyDiscount: any,
  newParticipant: any, 
  registrationData: any,
  getParticipantForRegistration: (registration: Registration) => Participant | undefined,
  registrations: Registration[]
) => {
  // Create wrapper for adding participant
  const handleAddParticipant = (
    e: React.FormEvent,
    resetForm: () => void,
    setIsAddParticipantOpen: (open: boolean) => void
  ) => {
    return baseHandleAddParticipant(
      e, 
      newParticipant,
      registrationData,
      resetForm,
      setIsAddParticipantOpen,
      getParticipantForRegistration
    );
  };

  // Create wrapper for adding payment
  const handleAddPayment = (
    e: React.FormEvent,
    newPayment: any,
    setIsAddPaymentOpen: (open: boolean) => void,
    setNewPayment: (payment: any) => void
  ) => {
    return baseHandleAddPayment(
      e,
      newPayment,
      setIsAddPaymentOpen,
      setNewPayment
    );
  };

  // Create wrapper for applying discount
  const handleApplyDiscount = (
    discountAmount: number,
    setIsAddPaymentOpen: (open: boolean) => void
  ) => {
    return baseHandleApplyDiscount(
      discountAmount,
      setIsAddPaymentOpen
    );
  };

  return {
    handleAddParticipant,
    handleAddPayment,
    handleApplyDiscount
  };
};
