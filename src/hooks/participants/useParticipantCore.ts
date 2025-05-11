
import { useState, useEffect, useMemo } from 'react';
import { Registration, Participant, Payment, PaymentStatus } from '@/types';
import { useParticipantUtils } from '@/hooks/useParticipantUtils';
import { calculatePaymentStatus } from '@/utils/paymentUtils';

export const useParticipantCore = (
  productId: string | undefined,
  dataContext: any
) => {
  const {
    participants: allParticipants,
    registrations: allRegistrations,
    products,
    payments,
    getPaymentsByRegistration,
    getRegistrationsByProduct,
    getHealthDeclarationForRegistration
  } = dataContext;

  // New loading state
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isAddParticipantOpen, setIsAddParticipantOpen] = useState(false);
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [currentHealthDeclaration, setCurrentHealthDeclaration] = useState<any>(null);
  const [newParticipant, setNewParticipant] = useState<any>({
    firstName: '',
    lastName: '',
    idNumber: '',
    phone: '',
    healthApproval: false
  });
  const [currentRegistration, setCurrentRegistration] = useState<Registration | null>(null);
  const [registrationData, setRegistrationData] = useState<any>({
    requiredAmount: 0,
    paidAmount: 0,
    receiptNumber: '',
    discountApproved: false,
    discountAmount: 0
  });
  const [newPayment, setNewPayment] = useState<any>({
    amount: 0,
    receiptNumber: ''
  });

  // Get the current product
  const product = useMemo(() => {
    return products.find((p: any) => p.id === productId);
  }, [products, productId]);

  // Get registrations for the current product
  const registrations = useMemo(() => {
    if (!productId) return [];
    return getRegistrationsByProduct(productId);
  }, [getRegistrationsByProduct, productId, refreshTrigger]);

  // Get participants for the current registrations
  const participants = useMemo(() => {
    return registrations
      .map(registration => {
        return allParticipants.find(p => p.id === registration.participantId);
      })
      .filter(Boolean) as Participant[];
  }, [registrations, allParticipants]);

  // Calculate summary metrics
  const totalParticipants = participants.length;
  const registrationsFilled = product?.maxParticipants ? Math.min(1, totalParticipants / product.maxParticipants) : 0;
  const totalExpected = registrations.reduce((sum, registration) => sum + registration.requiredAmount, 0);
  const totalPaid = registrations.reduce((sum, registration) => {
    const regPayments = getPaymentsByRegistration(registration.id);
    return sum + regPayments.reduce((pSum, payment) => pSum + payment.amount, 0);
  }, 0);

  useEffect(() => {
    if (productId) {
      // Set the default required amount to the product price when adding a new participant
      if (product) {
        setRegistrationData(prev => ({
          ...prev,
          requiredAmount: product.price || 0
        }));
      }
      setLoading(false);
    }
  }, [product, productId]);

  // Utility functions
  const { getParticipantForRegistration, getPaymentsForRegistration, getStatusClassName } = useParticipantUtils(
    allParticipants,
    payments
  );

  // Reset form function
  const resetForm = () => {
    setNewParticipant({
      firstName: '',
      lastName: '',
      idNumber: '',
      phone: '',
      healthApproval: false
    });
    setRegistrationData({
      requiredAmount: product?.price || 0,
      paidAmount: 0,
      receiptNumber: '',
      discountApproved: false,
      discountAmount: 0
    });
    setNewPayment({
      amount: 0,
      receiptNumber: ''
    });
    setCurrentRegistration(null);
  };

  return {
    loading,
    product,
    participants,
    registrations,
    refreshTrigger,
    setRefreshTrigger,
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
    getParticipantForRegistration,
    getPaymentsForRegistration,
    getStatusClassName,
    calculatePaymentStatus,  // Add this to expose the function
    getHealthDeclarationForRegistration,
    resetForm
  };
};
