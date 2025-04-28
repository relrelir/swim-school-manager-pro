
import { useState } from 'react';
import { toast } from "@/components/ui/use-toast";
import { Participant, Registration, Payment } from '@/types';

export const useRegistrationHandlers = (
  addParticipant: (participant: Omit<Participant, 'id'>) => Promise<Participant | undefined> | void,
  addRegistration: (registration: Omit<Registration, 'id'>) => Promise<Registration | undefined> | void,
  updateParticipant: (participant: Participant) => void,
  deleteRegistration: (id: string) => void,
  addPayment: (payment: Omit<Payment, 'id'>) => void,
  getPaymentsByRegistration: (registrationId: string) => Payment[],
  getRegistrationsByProduct: (productId: string) => Registration[]
) => {
  // Handle adding a new participant and registration
  const handleAddParticipant = async (
    e: React.FormEvent, 
    productId: string | undefined, 
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
    e.preventDefault();
    
    // If we don't have a product, return
    if (!productId) return;
    
    // Check if receipt number is provided
    if (!registrationData.receiptNumber) {
      toast({
        title: "שגיאה",
        description: "מספר קבלה הוא שדה חובה",
        variant: "destructive",
      });
      return;
    }
    
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
        paidAmount: registrationData.paidAmount,
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
    if (productId) {
      return getRegistrationsByProduct(productId);
    }
  };

  // Handle deleting a registration
  const handleDeleteRegistration = (
    registrationId: string,
    registrations: Registration[],
    productId?: string
  ) => {
    const registration = registrations.find(r => r.id === registrationId);
    if (!registration) return;
    
    const registrationPayments = getPaymentsByRegistration(registration.id);
    
    // Only allow deletion if there are no payments
    if (registrationPayments.length > 0) {
      toast({
        title: "לא ניתן למחוק",
        description: "לא ניתן למחוק רישום שבוצע עבורו תשלום",
        variant: "destructive",
      });
      return;
    }
    
    if (window.confirm('האם אתה בטוח שברצונך למחוק רישום זה?')) {
      deleteRegistration(registrationId);
      
      // Refresh registrations list
      if (productId) {
        return getRegistrationsByProduct(productId);
      }
    }
  };

  // Handle updating health approval
  const handleUpdateHealthApproval = (participant: Participant, isApproved: boolean) => {
    const updatedParticipant: Participant = {
      ...participant,
      healthApproval: isApproved
    };
    
    updateParticipant(updatedParticipant);
    
    toast({
      title: "אישור בריאות עודכן",
      description: `אישור בריאות ${isApproved ? 'התקבל' : 'בוטל'} עבור ${participant.firstName} ${participant.lastName}`,
    });
  };

  return {
    handleAddParticipant,
    handleDeleteRegistration,
    handleUpdateHealthApproval
  };
};
