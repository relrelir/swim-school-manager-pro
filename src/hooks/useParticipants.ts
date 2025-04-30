
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useData } from '@/context/DataContext';
import { Registration } from '@/types';
import { useParticipantForm } from './useParticipantForm';
import { useParticipantUtils } from './useParticipantUtils';
import { useHealthDeclarations } from './useHealthDeclarations';
import { useSummaryCalculations } from './useSummaryCalculations';
import { useRegistrationManagement } from './useRegistrationManagement';

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
    updateHealthDeclaration,
    getHealthDeclarationForRegistration,
    sendHealthDeclarationSMS
  } = useData();
  
  const [product, setProduct] = useState(undefined);
  
  // Import sub-hooks
  const {
    isAddParticipantOpen,
    setIsAddParticipantOpen,
    isAddPaymentOpen,
    setIsAddPaymentOpen,
    newParticipant,
    setNewParticipant,
    registrationData,
    setRegistrationData,
    newPayment,
    setNewPayment,
    resetForm
  } = useParticipantForm(product);
  
  // Participant utilities
  const {
    getParticipantForRegistration,
    getPaymentsForRegistration,
    getStatusClassName
  } = useParticipantUtils(participants, payments);

  // Registration management
  const {
    registrations,
    setRegistrations,
    refreshTrigger,
    currentRegistration,
    setCurrentRegistration,
    handleAddParticipant: baseHandleAddParticipant,
    handleAddPayment: baseHandleAddPayment,
    handleApplyDiscount,
    handleDeleteRegistration,
    handleUpdateHealthApproval
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

  // Health declarations hook
  const {
    isHealthFormOpen,
    setIsHealthFormOpen,
    currentHealthDeclaration,
    setCurrentHealthDeclaration,
    handleOpenHealthForm: baseHandleOpenHealthForm
  } = useHealthDeclarations(
    getHealthDeclarationForRegistration,
    sendHealthDeclarationSMS,
    addHealthDeclaration,
    updateHealthDeclaration
  );

  // Summary calculations
  const {
    totalParticipants,
    registrationsFilled,
    totalExpected,
    totalPaid
  } = useSummaryCalculations(registrations, product);

  // Load product and registrations data
  useEffect(() => {
    if (productId) {
      const currentProduct = products.find(p => p.id === productId);
      setProduct(currentProduct);
      
      if (currentProduct) {
        const productRegistrations = getRegistrationsByProduct(productId);
        setRegistrations(productRegistrations);
        
        // Set default required amount for new registrations
        setRegistrationData(prev => ({
          ...prev,
          requiredAmount: currentProduct.price,
        }));
      }
    }
  }, [productId, products, getRegistrationsByProduct, refreshTrigger]);

  // Handler for opening health form - wrapper to pass required parameters
  const handleOpenHealthForm = (registrationId: string) => {
    baseHandleOpenHealthForm(registrationId, getParticipantForRegistration, registrations);
  };

  // Wrapper for handleAddParticipant
  const handleAddParticipant = (e: React.FormEvent) => {
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
  const handleAddPayment = (e: React.FormEvent) => {
    return baseHandleAddPayment(
      e,
      newPayment,
      setIsAddPaymentOpen,
      setNewPayment
    );
  };

  return {
    product,
    registrations,
    isAddParticipantOpen,
    setIsAddParticipantOpen,
    isAddPaymentOpen,
    setIsAddPaymentOpen,
    isHealthFormOpen,
    setIsHealthFormOpen,
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
