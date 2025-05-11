
import { Registration, Participant } from '@/types';
import { useAddParticipantHandlers } from './participants/handlers/useAddParticipantHandlers';
import { usePaymentHandlers } from './participants/handlers/usePaymentHandlers';
import { useHealthHandlers } from './participants/handlers/useHealthHandlers';
import { useRegistrationHandlers } from './participants/handlers/useRegistrationHandlers';

/**
 * Composition hook for all participant-related handlers
 */
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
  const { handleOpenHealthForm, handleUpdateHealthApproval } = useHealthHandlers(
    dataContext,
    setRefreshTrigger,
    setCurrentHealthDeclaration,
    updateParticipant
  );
  
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

  return {
    handleOpenHealthForm,
    handleAddParticipant,
    handleAddPayment,
    handleApplyDiscount,
    handleDeleteRegistration,
    handleUpdateHealthApproval
  };
};
