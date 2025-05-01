
import { useState } from 'react';
import { Product, Participant, Registration } from '@/types';

/**
 * Hook for managing participant-related state
 */
export const useParticipantState = (product?: Product) => {
  const [isAddParticipantOpen, setIsAddParticipantOpen] = useState(false);
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [currentRegistration, setCurrentRegistration] = useState<Registration | null>(null);
  const [currentHealthDeclaration, setCurrentHealthDeclaration] = useState<{
    registrationId: string;
    participantName: string;
    phone: string;
    declaration?: any;
  } | null>(null);
  const [newParticipant, setNewParticipant] = useState<Omit<Participant, 'id'>>({
    firstName: '',
    lastName: '',
    phone: '',
    idNumber: '',
    healthApproval: false
  });
  const [registrationData, setRegistrationData] = useState({
    requiredAmount: product?.price || 0,
    paidAmount: 0,
    receiptNumber: '',
    discountApproved: false
  });
  const [newPayment, setNewPayment] = useState({
    amount: 0,
    receiptNumber: '',
    paymentDate: new Date().toISOString().split('T')[0],
  });

  // Update registration data when product changes
  if (product && registrationData.requiredAmount !== product.price) {
    setRegistrationData(prev => ({
      ...prev,
      requiredAmount: product.price
    }));
  }

  // Reset form helper
  const resetForm = () => {
    setNewParticipant({
      firstName: '',
      lastName: '',
      phone: '',
      idNumber: '',
      healthApproval: false
    });
    setRegistrationData({
      requiredAmount: product?.price || 0,
      paidAmount: 0,
      receiptNumber: '',
      discountApproved: false
    });
  };

  return {
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
  };
};
