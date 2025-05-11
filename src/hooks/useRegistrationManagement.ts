
import { useState } from 'react';
import { Registration, Participant, Payment } from '@/types';

export const useRegistrationManagement = (
  product: any,
  productId: string | undefined,
  participants: Participant[],
  addParticipant: (participant: Omit<Participant, 'id'>) => Promise<Participant | undefined> | void,
  addRegistration: (registration: Omit<Registration, 'id'>) => Promise<Registration | undefined> | void,
  updateRegistration: (registration: Registration) => void,
  deleteRegistration: (id: string) => void,
  addPayment: (payment: Omit<Payment, 'id'>) => Promise<Payment | undefined> | void,
  getPaymentsByRegistration: (registrationId: string) => any[],
  getRegistrationsByProduct: (productId: string) => Registration[],
  updateParticipant: (participant: Participant) => void,
  addHealthDeclaration: (declaration: Omit<any, 'id'>) => void
) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  // Add currentRegistration state since it was missing
  const [currentRegistration, setCurrentRegistration] = useState<Registration | null>(null);

  // Create our own payment handlers with proper implementation
  const handleAddPayment = async (
    e: React.FormEvent,
    newPayment: any,
    setIsAddPaymentOpen: (open: boolean) => void,
    setNewPayment: (payment: any) => void
  ) => {
    e.preventDefault();
    
    // Make sure the payment has a registration ID
    if (!newPayment.registrationId && currentRegistration) {
      newPayment.registrationId = currentRegistration.id;
    }
    
    if (!newPayment.registrationId) {
      console.error("Missing registration ID for payment");
      return registrations;
    }
    
    try {
      // Add the payment
      await addPayment({
        registrationId: newPayment.registrationId,
        amount: newPayment.amount,
        receiptNumber: newPayment.receiptNumber,
        paymentDate: newPayment.paymentDate
      });
      
      // Find the registration to update its paidAmount
      const registration = registrations.find(r => r.id === newPayment.registrationId);
      if (registration) {
        const updatedRegistration = {
          ...registration,
          paidAmount: registration.paidAmount + newPayment.amount
        };
        
        // Update the registration
        await updateRegistration(updatedRegistration);
      }
      
      // Reset payment form and close dialog
      setNewPayment({
        amount: 0,
        receiptNumber: '',
        paymentDate: new Date().toISOString().split('T')[0]
      });
      setIsAddPaymentOpen(false);
      
      // Refresh registrations list
      if (productId) {
        const updatedRegistrations = getRegistrationsByProduct(productId);
        setRegistrations(updatedRegistrations);
        return updatedRegistrations;
      }
    } catch (error) {
      console.error('Error adding payment:', error);
    }
    
    return registrations;
  };

  // Implement the apply discount function
  const handleApplyDiscount = async (
    discountAmount: number,
    setIsAddPaymentOpen: (open: boolean) => void,
    registrationId?: string
  ) => {
    try {
      // Use either the provided registrationId or the current registration's id
      const targetRegistrationId = registrationId || currentRegistration?.id;
      
      if (!targetRegistrationId) {
        console.error("No registration ID for applying discount");
        return registrations;
      }
      
      // Find the registration
      const registration = registrations.find(r => r.id === targetRegistrationId);
      if (registration) {
        // Update the registration with the discount
        const updatedRegistration = {
          ...registration,
          discountApproved: true,
          discountAmount: discountAmount
        };
        
        // Update the registration
        await updateRegistration(updatedRegistration);
        
        // Close the dialog
        setIsAddPaymentOpen(false);
        
        // Refresh registrations list
        if (productId) {
          const updatedRegistrations = getRegistrationsByProduct(productId);
          setRegistrations(updatedRegistrations);
          return updatedRegistrations;
        }
      }
    } catch (error) {
      console.error('Error applying discount:', error);
    }
    
    return registrations;
  };

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
    
    // Ensure paidAmount equals product price
    const formData = {
      ...registrationData,
      // Force the paid amount to match the required amount (product price)
      paidAmount: registrationData.paidAmount
    };
    
    try {
      // Use the useRegistrationHandlers implementation
      const result = await handleAddParticipantImpl(
        e, 
        productId,
        newParticipant,
        formData,
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
    } catch (error) {
      console.error('Error adding participant:', error);
    }
    
    return [];
  };

  // Implement the function that adds a participant
  const handleAddParticipantImpl = async (
    e: React.FormEvent, 
    productId: string, 
    newParticipant: Omit<Participant, 'id'>, 
    registrationData: {
      requiredAmount: number;
      paidAmount: number;
      receiptNumber: string;
      discountApproved: boolean;
    },
    resetForm: () => void,
    setIsAddParticipantOpen: (open: boolean) => void
  ) => {
    // Implementing the basic functionality from useRegistrationHandlers
    if (!productId) return [];
    
    // Adding new participant
    const participant: Omit<Participant, 'id'> = {
      firstName: newParticipant.firstName,
      lastName: newParticipant.lastName,
      idNumber: newParticipant.idNumber,
      phone: newParticipant.phone,
      healthApproval: newParticipant.healthApproval,
    };
    
    // Add participant first
    const addedParticipant = await addParticipant(participant);
    
    if (addedParticipant) {
      // Then add registration
      const newRegistration: Omit<Registration, 'id'> = {
        productId: productId,
        participantId: addedParticipant.id,
        requiredAmount: registrationData.requiredAmount,
        paidAmount: registrationData.paidAmount, // Use the actual paid amount
        receiptNumber: registrationData.receiptNumber,
        discountApproved: registrationData.discountApproved,
        registrationDate: new Date().toISOString(),
      };
      
      const addedRegistration = await addRegistration(newRegistration);
      
      // Add initial payment if amount is greater than 0
      if (registrationData.paidAmount > 0 && addedRegistration) {
        const initialPayment: Omit<Payment, 'id'> = {
          registrationId: addedRegistration.id,
          amount: registrationData.paidAmount,
          receiptNumber: registrationData.receiptNumber,
          paymentDate: new Date().toISOString(),
        };
        
        await addPayment(initialPayment);
      }
    }
    
    // Reset form and close dialog
    resetForm();
    setIsAddParticipantOpen(false);
    
    // Refresh registrations list
    return getRegistrationsByProduct(productId);
  };

  const handleDeleteRegistration = async (registrationId: string) => {
    try {
      // Find the registration
      const registration = registrations.find(r => r.id === registrationId);
      if (!registration) return registrations;
      
      // Check if there are any payments
      const payments = getPaymentsByRegistration(registrationId);
      if (payments.length > 0) {
        alert("לא ניתן למחוק רישום עם תשלומים");
        return registrations;
      }
      
      // Delete the registration
      await deleteRegistration(registrationId);
      
      // Refresh registrations list
      if (productId) {
        const updatedRegistrations = getRegistrationsByProduct(productId);
        setRegistrations(updatedRegistrations);
        return updatedRegistrations;
      }
    } catch (error) {
      console.error('Error deleting registration:', error);
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
  };
};
