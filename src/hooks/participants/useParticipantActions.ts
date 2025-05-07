
import { Registration, Participant } from '@/types';
import { useParticipantHandlers } from '../useParticipantHandlers';
import { useRegistrationManagement } from '../useRegistrationManagement';
import { useParticipantHealth } from '../useParticipantHealth';
import { useParticipantAdapters } from '../useParticipantAdapters';
import { toast } from "@/components/ui/use-toast";

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
    deleteParticipant,
    addPayment,
    getPaymentsByRegistration,
    getRegistrationsByProduct,
    addHealthDeclaration,
    updateHealthDeclaration: baseUpdateHealthDeclaration,
    getHealthDeclarationForRegistration,
    deleteHealthDeclaration
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
    handleDeleteRegistration: managementHandleDeleteRegistration
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

  // Implement the handleDeleteRegistration function according to requirements
  const handleDeleteRegistration = async (registrationId: string) => {
    try {
      // Check if the registration has any payments
      const payments = await getPaymentsByRegistration(registrationId);
      if (payments.length > 0) {
        toast({
          title: "לא ניתן למחוק",
          description: "לא ניתן למחוק רישום שבוצע עבורו תשלום",
          variant: "destructive",
        });
        return;
      }
      
      // Find the registration to get the participant ID
      const registration = registrations.find(r => r.id === registrationId);
      if (!registration) {
        console.error("Registration not found:", registrationId);
        return;
      }
      
      const participantId = registration.participantId;
      
      // Check if there's a health declaration to delete
      const healthDecl = await getHealthDeclarationForRegistration(registrationId);
      if (healthDecl) {
        await deleteHealthDeclaration(healthDecl.id);
      }
      
      // Delete the registration first
      await deleteRegistration(registrationId);
      
      // Check if the participant has other registrations before deleting
      const otherRegistrations = registrations.filter(
        r => r.participantId === participantId && r.id !== registrationId
      );
      
      if (otherRegistrations.length === 0) {
        // Only delete the participant if they have no other registrations
        await deleteParticipant(participantId);
      }
      
      // Trigger a refresh to update the UI
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error("Error deleting registration:", error);
      toast({
        title: "שגיאה במחיקת רישום",
        description: "אירעה שגיאה בעת מחיקת הרישום",
        variant: "destructive",
      });
    }
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
