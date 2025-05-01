
import { useParams } from 'react-router-dom';
import { useData } from '@/context/DataContext';
import { Registration, Participant } from '@/types';
import { useParticipantUtils } from './useParticipantUtils';
import { useRegistrationManagement } from './useRegistrationManagement';
import { useParticipantHealth } from './useParticipantHealth';
import { useParticipantHandlers } from './useParticipantHandlers';
import { useParticipantState } from './useParticipantState';
import { useParticipantAdapters } from './useParticipantAdapters';
import { useParticipantEffects } from './useParticipantEffects';

export const useParticipants = () => {
  const { productId } = useParams<{ productId: string }>();
  const { 
    products, 
    participants, 
    updateParticipant,
    getRegistrationsByProduct, 
    addRegistration, 
    updateRegistration,
    deleteRegistration,
    calculatePaymentStatus,
    addPayment,
    getPaymentsByRegistration,
    payments,
    addParticipant,
    healthDeclarations,
    addHealthDeclaration,
    updateHealthDeclaration: baseUpdateHealthDeclaration,
    getHealthDeclarationForRegistration
  } = useData();

  // Import participant utilities
  const {
    getParticipantForRegistration,
    getPaymentsForRegistration,
    getStatusClassName
  } = useParticipantUtils(participants, payments);

  // Load product and registration data via effects
  const {
    product,
    registrations,
    setRegistrations,
    refreshTrigger,
    setRefreshTrigger,
    totalParticipants,
    registrationsFilled,
    totalExpected,
    totalPaid
  } = useParticipantEffects(productId, products, undefined, getRegistrationsByProduct);

  // Import participant state management
  const {
    isAddParticipantOpen,
    setIsAddParticipantOpen,
    isAddPaymentOpen,
    setIsAddPaymentOpen,
    isLinkDialogOpen,
    setIsLinkDialogOpen,
    currentRegistration,
    setCurrentRegistration,
    currentHealthDeclaration,
    setCurrentHealthDeclaration,
    newParticipant,
    setNewParticipant,
    registrationData,
    setRegistrationData,
    newPayment,
    setNewPayment,
    resetForm
  } = useParticipantState(product);

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
    product,
    registrations,
    isAddParticipantOpen,
    setIsAddParticipantOpen,
    isAddPaymentOpen,
    setIsAddPaymentOpen,
    isLinkDialogOpen,
    setIsLinkDialogOpen,
    currentHealthDeclaration,
    setCurrentHealthDeclaration,
    newParticipant,
    setNewParticipant,
    currentRegistration,
    setCurrentRegistration,
    registrationData,
    setRegistrationData,
    newPayment,
    setNewPayment,
    totalParticipants,
    registrationsFilled,
    totalExpected,
    totalPaid,
    participants,
    handleAddParticipant,
    handleAddPayment,
    handleApplyDiscount,
    handleDeleteRegistration,
    handleUpdateHealthApproval,
    handleOpenHealthForm,
    resetForm,
    getParticipantForRegistration,
    getPaymentsForRegistration,
    getStatusClassName,
    calculatePaymentStatus,
    getHealthDeclarationForRegistration,
  };
};
