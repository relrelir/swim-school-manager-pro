
import { Participant, Registration } from '@/types';
import { useAddParticipantHandlers } from './handlers/useAddParticipantHandlers';
import { usePaymentHandlers } from './handlers/usePaymentHandlers';
import { useRegistrationHandlers } from './handlers/useRegistrationHandlers';
import { useHealthHandlers } from './handlers/useHealthHandlers';

export const useParticipantHandlers = (
  productId: string | undefined,
  dataContext: any,
  setIsAddParticipantOpen: (open: boolean) => void,
  setIsAddPaymentOpen: (open: boolean) => void,
  setRefreshTrigger: (value: React.SetStateAction<number>) => void,
  resetForm: () => void,
  currentRegistration: Registration | null,
  newParticipant: Omit<Participant, 'id'>,
  registrationData: any,
  newPayment: any,
  setCurrentHealthDeclaration: React.Dispatch<React.SetStateAction<any>>,
  setNewPayment: React.Dispatch<React.SetStateAction<any>>,
  addParticipant: (participant: Omit<Participant, 'id'>) => Promise<Participant | undefined>,
  updateParticipant: (participant: Participant) => void
) => {
  // Use the refactored handler hooks
  const { handleAddParticipant } = useAddParticipantHandlers(
    productId, 
    dataContext, 
    setIsAddParticipantOpen, 
    setRefreshTrigger, 
    resetForm, 
    newParticipant, 
    registrationData,
    addParticipant
  );

  const { handleAddPayment, handleApplyDiscount } = usePaymentHandlers(
    currentRegistration,
    dataContext,
    setIsAddPaymentOpen,
    setRefreshTrigger,
    newPayment,
    setNewPayment
  );

  const { handleDeleteRegistration } = useRegistrationHandlers(
    dataContext,
    setRefreshTrigger
  );

  const { handleUpdateHealthApproval, handleOpenHealthForm } = useHealthHandlers(
    dataContext,
    setRefreshTrigger,
    setCurrentHealthDeclaration,
    updateParticipant
  );

  return {
    handleAddParticipant,
    handleAddPayment,
    handleDeleteRegistration,
    handleUpdateHealthApproval,
    handleOpenHealthForm,
    handleApplyDiscount
  };
};
