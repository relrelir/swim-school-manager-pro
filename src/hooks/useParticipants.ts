import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useData } from '@/context/DataContext';
import { Registration, HealthDeclaration } from '@/types';
import { useParticipantForm } from './useParticipantForm';
import { usePaymentHandlers } from './usePaymentHandlers';
import { useRegistrationHandlers } from './useRegistrationHandlers';
import { useParticipantUtils } from './useParticipantUtils';

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
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isHealthFormOpen, setIsHealthFormOpen] = useState(false);
  const [currentHealthDeclaration, setCurrentHealthDeclaration] = useState<{
    registrationId: string;
    participantName: string;
    phone: string;
    declaration?: HealthDeclaration;
  } | null>(null);
  
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
  
  const {
    currentRegistration,
    setCurrentRegistration,
    handleAddPayment: baseHandleAddPayment,
    handleApplyDiscount: baseHandleApplyDiscount
  } = usePaymentHandlers(addPayment, updateRegistration, getRegistrationsByProduct);
  
  const {
    handleAddParticipant: baseHandleAddParticipant,
    handleDeleteRegistration: baseHandleDeleteRegistration,
    handleUpdateHealthApproval
  } = useRegistrationHandlers(
    addParticipant,
    addRegistration,
    updateParticipant,
    deleteRegistration,
    addPayment,
    getPaymentsByRegistration,
    getRegistrationsByProduct
  );
  
  const {
    getParticipantForRegistration,
    getPaymentsForRegistration,
    getStatusClassName
  } = useParticipantUtils(participants, payments);

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

  // Handler for opening health form
  const handleOpenHealthForm = (registrationId: string) => {
    const registration = registrations.find(reg => reg.id === registrationId);
    if (!registration) return;

    const participant = getParticipantForRegistration(registration);
    if (!participant) return;

    const healthDeclaration = getHealthDeclarationForRegistration(registrationId);

    setCurrentHealthDeclaration({
      registrationId,
      participantName: `${participant.firstName} ${participant.lastName}`,
      phone: participant.phone,
      declaration: healthDeclaration
    });

    setIsHealthFormOpen(true);
  };

  // Handler for adding a new participant with health declaration
  const handleAddParticipant = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await baseHandleAddParticipant(
      e, 
      productId,
      newParticipant,
      registrationData,
      resetForm,
      setIsAddParticipantOpen
    );
    
    if (result && result.length > 0) {
      // Find the new registration (should be the last one added)
      const newRegistration = result[result.length - 1];
      
      // Create a health declaration entry for the new registration
      if (newRegistration) {
        const participant = getParticipantForRegistration(newRegistration);
        if (participant) {
          await addHealthDeclaration({
            registrationId: newRegistration.id,
            phone: participant.phone,
            formStatus: 'pending',
            sentAt: new Date().toISOString()
          });
        }
      }
      
      setRegistrations(result);
      setRefreshTrigger(prev => prev + 1);
    }
  };

  // Wrap other handlers with local state
  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedRegistrations = baseHandleAddPayment(
      e,
      newPayment,
      setIsAddPaymentOpen,
      setNewPayment,
      productId
    );
    
    if (updatedRegistrations.length > 0) {
      setRegistrations(updatedRegistrations);
    }
  };

  const handleApplyDiscount = (discountAmount: number) => {
    const updatedRegistrations = baseHandleApplyDiscount(
      discountAmount,
      setIsAddPaymentOpen,
      productId
    );
    
    if (updatedRegistrations.length > 0) {
      setRegistrations(updatedRegistrations);
    }
  };

  const handleDeleteRegistration = async (registrationId: string) => {
    const result = await baseHandleDeleteRegistration(
      registrationId,
      registrations,
      productId
    );
    
    if (result) {
      setRegistrations(result);
    }
  };

  // Calculate totals
  const totalParticipants = registrations.length;
  const registrationsFilled = product ? (totalParticipants / product.maxParticipants) * 100 : 0;
  const totalExpected = registrations.reduce((sum, reg) => sum + reg.requiredAmount, 0);
  const totalPaid = registrations.reduce((sum, reg) => sum + reg.paidAmount, 0);

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
