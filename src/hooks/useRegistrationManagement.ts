
import { useState } from 'react';
import { Registration, Participant } from '@/types';
import { usePaymentHandlers } from './usePaymentHandlers';
import { useRegistrationHandlers } from './useRegistrationHandlers';

export const useRegistrationManagement = (
  product: any,
  productId: string | undefined,
  participants: Participant[],
  addParticipant: (participant: Omit<Participant, 'id'>) => Promise<Participant | undefined> | void,
  addRegistration: (registration: Omit<Registration, 'id'>) => Promise<Registration | undefined> | void,
  updateRegistration: (registration: Registration) => void,
  deleteRegistration: (id: string) => void,
  addPayment: (payment: any) => void,
  getPaymentsByRegistration: (registrationId: string) => any[],
  getRegistrationsByProduct: (productId: string) => Registration[],
  updateParticipant: (participant: Participant) => void,
  addHealthDeclaration: (declaration: Omit<any, 'id'>) => void
) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [registrations, setRegistrations] = useState<Registration[]>([]);

  // Import sub-hooks
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

  // Handler for adding a new participant with health declaration
  const handleAddParticipant = async (
    e: React.FormEvent, 
    newParticipant: any, 
    registrationData: any, 
    resetForm: () => void, 
    setIsAddParticipantOpen: (open: boolean) => void,
    getParticipantForRegistration: (registration: Registration) => Participant | undefined
  ) => {
    e.preventDefault();
    
    if (!productId) return [];
    
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
      return result;
    }
    
    return [];
  };

  // Wrap other handlers with local state
  const handleAddPayment = (
    e: React.FormEvent,
    newPayment: any,
    setIsAddPaymentOpen: (open: boolean) => void,
    setNewPayment: (payment: any) => void
  ) => {
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
      return updatedRegistrations;
    }
    
    return registrations;
  };

  const handleApplyDiscount = (
    discountAmount: number,
    setIsAddPaymentOpen: (open: boolean) => void
  ) => {
    const updatedRegistrations = baseHandleApplyDiscount(
      discountAmount,
      setIsAddPaymentOpen,
      productId
    );
    
    if (updatedRegistrations.length > 0) {
      setRegistrations(updatedRegistrations);
      return updatedRegistrations;
    }
    
    return registrations;
  };

  const handleDeleteRegistration = async (registrationId: string) => {
    const result = await baseHandleDeleteRegistration(
      registrationId,
      registrations,
      productId
    );
    
    if (result) {
      setRegistrations(result);
      return result;
    }
    
    return registrations;
  };

  return {
    registrations,
    setRegistrations,
    refreshTrigger,
    setRefreshTrigger,
    currentRegistration,
    setCurrentRegistration,
    handleAddParticipant,
    handleAddPayment,
    handleApplyDiscount,
    handleDeleteRegistration,
    handleUpdateHealthApproval
  };
};
