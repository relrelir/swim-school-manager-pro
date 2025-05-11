
import { useState, useEffect } from 'react';
import { Participant, Product } from '@/types';

export const useParticipantForm = (product?: Product) => {
  const [isAddParticipantOpen, setIsAddParticipantOpen] = useState(false);
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  
  const [newParticipant, setNewParticipant] = useState<Omit<Participant, 'id'>>({
    firstName: '',
    lastName: '',
    idNumber: '',
    phone: '',
    healthApproval: false,
  });
  
  const [registrationData, setRegistrationData] = useState({
    requiredAmount: product?.price || 0,
    paidAmount: product?.price || 0, // Initialize paid amount equal to product price
    receiptNumber: '',
    discountApproved: false,
  });
  
  const [newPayment, setNewPayment] = useState({
    amount: 0,
    receiptNumber: '',
    paymentDate: new Date().toISOString().substring(0, 10),
  });

  // Update requiredAmount and paidAmount whenever product changes
  useEffect(() => {
    if (product?.price) {
      setRegistrationData(prev => ({
        ...prev,
        requiredAmount: product.price,
        paidAmount: product.price, // Ensure paid amount equals product price
      }));
    }
  }, [product]);

  // Reset form data
  const resetForm = () => {
    setNewParticipant({
      firstName: '',
      lastName: '',
      idNumber: '',
      phone: '',
      healthApproval: false,
    });
    
    setRegistrationData({
      requiredAmount: product?.price || 0,
      paidAmount: product?.price || 0, // Reset paid amount to product price
      receiptNumber: '',
      discountApproved: false,
    });
  };

  return {
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
    resetForm,
  };
};
