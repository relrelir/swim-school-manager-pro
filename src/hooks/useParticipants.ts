
import { useParams } from 'react-router-dom';
import { useData } from '@/context/DataContext';
import { Registration, Participant } from '@/types';
import { useParticipantForm } from './useParticipantForm';
import { useParticipantUtils } from './useParticipantUtils';
import { useRegistrationManagement } from './useRegistrationManagement';
import { useParticipantHealth } from './useParticipantHealth';
import { useParticipantData } from './useParticipantData';
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
    setCurrentHealthDeclaration
  } = useParticipantState();

  // Load product and registration data via effects
  const {
    product,
    registrations,
    setRegistrations,
    refreshTrigger,
    setRefreshTrigger
  } = useParticipantEffects(productId, products, undefined, getRegistrationsByProduct);

  // Create an adapter for updateHealthDeclaration to match expected signature
  const updateHealthDeclaration = (declaration: any) => {
    return baseUpdateHealthDeclaration(declaration.id, declaration);
  };

  // Import participant form hook
  const {
    newParticipant,
    setNewParticipant,
    registrationData,
    setRegistrationData,
    newPayment,
    setNewPayment,
    resetForm
  } = useParticipantForm(product);

  // Create adapters for various function signatures
  const {
    adaptedUpdateParticipant,
    adaptedHandleOpenHealthForm,
    handleAddParticipantWrapper,
    handleAddPaymentWrapper,
    handleApplyDiscountAdapter
  } = useParticipantAdapters(
    updateParticipant,
    (registrationId: string) => {},  // placeholder to be overridden
    () => {}, // placeholder for baseHandleAddParticipant
    () => {}, // placeholder for baseHandleAddPayment
    () => {}  // placeholder for baseHandleApplyDiscount
  );

  // Import participant health hook with adapted update function
  const {
    handleOpenHealthForm: baseHandleOpenHealthForm,
    handleUpdateHealthApproval
  } = useParticipantHealth(
    getHealthDeclarationForRegistration,
    addHealthDeclaration,
    adaptedUpdateParticipant,
    participants,
    registrations
  );

  // Import participant data hook
  const {
    totalParticipants,
    registrationsFilled,
    totalExpected,
    totalPaid
  } = useParticipantData(product, productId, getRegistrationsByProduct, getPaymentsForRegistration);

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
