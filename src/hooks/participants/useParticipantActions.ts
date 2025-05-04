
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
  currentRegistration?: Registration | null,
  setCurrentRegistration?: (registration: Registration | null) => void
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

  // Import registration management hook with currentRegistration
  const {
    handleAddParticipant: baseHandleAddParticipant,
    handleAddPayment: baseHandleAddPayment,
    handleApplyDiscount: baseHandleApplyDiscount,
    handleDeleteRegistration,
    currentRegistration: registrationManagementCurrentReg,
    setCurrentRegistration: registrationManagementSetCurrentReg
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

  // Use the current registration from props if provided, otherwise use the one from registration management
  const effectiveCurrentRegistration = currentRegistration || registrationManagementCurrentReg;
  const effectiveSetCurrentRegistration = setCurrentRegistration || registrationManagementSetCurrentReg;

  // Make sure we set the current registration in the registration management hook when it changes
  if (currentRegistration && registrationManagementSetCurrentReg && 
     (!registrationManagementCurrentReg || registrationManagementCurrentReg.id !== currentRegistration.id)) {
    console.log("Syncing currentRegistration to registrationManagement:", currentRegistration);
    registrationManagementSetCurrentReg(currentRegistration);
  }

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

  // Import participant handlers with actual implementations and current registration
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
    registrations,
    effectiveCurrentRegistration // Make sure we're passing the current registration
  );

  // Final wrapper for handleAddParticipant
  const handleAddParticipant = (e: React.FormEvent) => {
    return wrapperHandleAddParticipant(e, resetForm, setIsAddParticipantOpen);
  };

  // Final wrapper for handleAddPayment with debug logging
  const handleAddPayment = (e: React.FormEvent) => {
    console.log("useParticipantActions.handleAddPayment called with currentRegistration:", effectiveCurrentRegistration);
    return wrapperHandleAddPayment(e, newPayment, setIsAddPaymentOpen, setNewPayment);
  };

  return {
    handleAddParticipant,
    handleAddPayment,
    handleApplyDiscount,
    handleDeleteRegistration,
    handleUpdateHealthApproval,
    handleOpenHealthForm,
    currentRegistration: effectiveCurrentRegistration,
    setCurrentRegistration: effectiveSetCurrentRegistration
  };
};
