
import { useState } from 'react';
import { Participant, Registration } from '@/types';

export const useParticipantsState = (productPrice: number = 0) => {
  const [isAddParticipantOpen, setIsAddParticipantOpen] = useState(false);
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [currentHealthDeclaration, setCurrentHealthDeclaration] = useState<any>(null);
  const [newParticipant, setNewParticipant] = useState<Omit<Participant, 'id'>>({
    firstName: '',
    lastName: '',
    idNumber: '',
    phone: '',
    healthApproval: false
  });
  const [currentRegistration, setCurrentRegistration] = useState<Registration | null>(null);
  const [registrationData, setRegistrationData] = useState({
    requiredAmount: productPrice,
    paidAmount: 0,
    receiptNumber: '',
    discountApproved: false,
    discountAmount: 0
  });
  const [newPayment, setNewPayment] = useState({
    amount: 0,
    receiptNumber: '',
    paymentDate: new Date().toISOString().split('T')[0]
  });
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Function to reset forms to initial state
  const resetForm = () => {
    setNewParticipant({
      firstName: '',
      lastName: '',
      idNumber: '',
      phone: '',
      healthApproval: false
    });
    setRegistrationData({
      requiredAmount: productPrice,
      paidAmount: 0,
      receiptNumber: '',
      discountApproved: false,
      discountAmount: 0
    });
    setNewPayment({
      amount: 0,
      receiptNumber: '',
      paymentDate: new Date().toISOString().split('T')[0]
    });
    setCurrentRegistration(null);
  };

  return {
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
    refreshTrigger,
    setRefreshTrigger,
    resetForm
  };
};
