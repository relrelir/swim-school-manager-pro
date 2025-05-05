
import { Registration, Participant } from '@/types';
import { useParticipantHandlers } from '../useParticipantHandlers';
import { useRegistrationManagement } from '../useRegistrationManagement';
import { useParticipantHealth } from '../useParticipantHealth';
import { useParticipantAdapters } from '../useParticipantAdapters';

/**
 * Hook for participant-related actions and handlers
 */
export const useParticipantActions = (
  productId: string | undefined,
  dataContext: any,
  participants: Participant[],
  registrations: Registration[],
  product: any,
  setRefreshTrigger: (value: React.SetStateAction<number>) => void,
  newParticipant: any,
  registrationData: any,
  getParticipantForRegistration: (registration: Registration) => Participant | undefined,
  setIsAddParticipantOpen: (value: boolean) => void,
  setIsAddPaymentOpen: (value: boolean) => void,
  setNewPayment: (value: any) => void,
  newPayment: any,
  resetForm: () => void,
  currentRegistration: Registration | null
) => {
  const {
    updateParticipant,
    addParticipant,
    addRegistration,
    updateRegistration,
    deleteRegistration,
    addPayment,
    getPaymentsByRegistration,
    getRegistrationsByProduct,
    addHealthDeclaration,
    updateHealthDeclaration: baseUpdateHealthDeclaration,
    getHealthDeclarationForRegistration
  } = dataContext;

  // Create an adapter for updateHealthDeclaration to match expected signature
  const updateHealthDeclaration = (declaration: any) => {
    return baseUpdateHealthDeclaration(declaration.id, declaration);
  };

  // Import participant health hook with adapted update function
  const {
    handleOpenHealthForm: baseHandleOpenHealthForm,
    handleUpdateHealthApproval
  } = useParticipantHealth(
    getHealthDeclarationForRegistration,
    addHealthDeclaration,
    async (id: string, data: Partial<Participant>): Promise<Participant> => {
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
    },
    participants,
    registrations
  );

  // Import registration management hook
  const {
    handleAddParticipant: baseHandleAddParticipant,
    handleAddPayment: baseHandleAddPayment,
    handleApplyDiscount: baseHandleApplyDiscount,
    handleDeleteRegistration
  } = useRegistrationManagement(
    product,
    productId,
    participants,
    addParticipant,
    addRegistration,
    updateRegistration,
    deleteRegistration,
    addPayment,
    getPaymentsByRegistration,
    getRegistrationsByProduct,
    updateParticipant,
    addHealthDeclaration
  );

  // Create adapters for various function signatures
  const {
    adaptedHandleOpenHealthForm,
    handleAddParticipantWrapper,
    handleAddPaymentWrapper,
    handleApplyDiscountAdapter
  } = useParticipantAdapters(
    updateParticipant,
    baseHandleOpenHealthForm,
    baseHandleAddParticipant,
    baseHandleAddPayment,
    baseHandleApplyDiscount
  );

  // Import participant handlers with actual implementations
  const {
    handleOpenHealthForm,
    handleAddParticipant: wrapperHandleAddParticipant,
    handleAddPayment: wrapperHandleAddPayment,
    handleApplyDiscount
  } = useParticipantHandlers(
    adaptedHandleOpenHealthForm || baseHandleOpenHealthForm,
    baseHandleAddParticipant,
    baseHandleAddPayment,
    baseHandleApplyDiscount,
    newParticipant,
    registrationData,
    getParticipantForRegistration,
    registrations
  );

  // Final wrapper for handleAddParticipant
  const handleAddParticipant = (e: React.FormEvent) => {
    return wrapperHandleAddParticipant(e, resetForm, setIsAddParticipantOpen);
  };

  // Final wrapper for handleAddPayment
  const handleAddPayment = (e: React.FormEvent) => {
    return wrapperHandleAddPayment(e, newPayment, setIsAddPaymentOpen, setNewPayment);
  };

  return {
    handleAddParticipant,
    handleAddPayment,
    handleApplyDiscount,
    handleDeleteRegistration,
    handleUpdateHealthApproval,
    handleOpenHealthForm
  };
};
