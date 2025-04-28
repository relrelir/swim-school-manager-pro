
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useData } from '@/context/DataContext';
import { toast } from "@/components/ui/use-toast";
import { Participant, Product, Registration, Payment, PaymentStatus } from '@/types';

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
    addParticipant
  } = useData();
  
  const [product, setProduct] = useState<Product | undefined>();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isAddParticipantOpen, setIsAddParticipantOpen] = useState(false);
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  const [newParticipant, setNewParticipant] = useState<Omit<Participant, 'id'>>({
    firstName: '',
    lastName: '',
    idNumber: '',
    phone: '',
    healthApproval: false,
  });
  
  const [currentRegistration, setCurrentRegistration] = useState<Registration | null>(null);
  const [registrationData, setRegistrationData] = useState({
    requiredAmount: 0,
    paidAmount: 0,
    receiptNumber: '',
    discountApproved: false,
  });
  
  const [newPayment, setNewPayment] = useState({
    amount: 0,
    receiptNumber: '',
    paymentDate: new Date().toISOString().substring(0, 10),
  });

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
  }, [productId, products, getRegistrationsByProduct]);

  // Handle adding a new participant and registration
  const handleAddParticipant = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // If we don't have a product, return
    if (!product) return;
    
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
        productId: productId || '',
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
      setRegistrations(getRegistrationsByProduct(productId));
    }
  };

  // Handle adding a new payment
  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentRegistration) {
      // Check if receipt number is provided
      if (!newPayment.receiptNumber) {
        toast({
          title: "שגיאה",
          description: "מספר קבלה הוא שדה חובה",
          variant: "destructive",
        });
        return;
      }
      
      // Add the new payment
      const payment: Omit<Payment, 'id'> = {
        registrationId: currentRegistration.id,
        amount: newPayment.amount,
        receiptNumber: newPayment.receiptNumber,
        paymentDate: newPayment.paymentDate,
      };
      
      addPayment(payment);
      
      // Update the registration's paidAmount
      const updatedPaidAmount = currentRegistration.paidAmount + newPayment.amount;
      
      const updatedRegistration: Registration = {
        ...currentRegistration,
        paidAmount: updatedPaidAmount,
      };
      
      updateRegistration(updatedRegistration);
      
      // Reset form and close dialog
      setCurrentRegistration(null);
      setNewPayment({
        amount: 0,
        receiptNumber: '',
        paymentDate: new Date().toISOString().substring(0, 10),
      });
      setIsAddPaymentOpen(false);
      
      // Refresh registrations list
      if (productId) {
        setRegistrations(getRegistrationsByProduct(productId));
      }
    }
  };

  // Handle applying a discount
  const handleApplyDiscount = (discountAmount: number) => {
    if (currentRegistration) {
      // Update the registration with discount
      const updatedRegistration: Registration = {
        ...currentRegistration,
        paidAmount: currentRegistration.paidAmount + discountAmount,
        discountApproved: true,
      };
      
      updateRegistration(updatedRegistration);
      
      toast({
        title: "הנחה אושרה",
        description: `הנחה בסך ${Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(discountAmount)} אושרה למשתתף`,
      });
      
      // Reset form and close dialog
      setCurrentRegistration(null);
      setIsAddPaymentOpen(false);
      
      // Refresh registrations list
      if (productId) {
        setRegistrations(getRegistrationsByProduct(productId));
      }
    }
  };

  // Handle deleting a registration
  const handleDeleteRegistration = (registrationId: string) => {
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
        setRegistrations(getRegistrationsByProduct(productId));
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
      paidAmount: 0,
      receiptNumber: '',
      discountApproved: false,
    });
  };

  // Get participant details for a registration
  const getParticipantForRegistration = (registration: Registration): Participant | undefined => {
    return participants.find(p => p.id === registration.participantId);
  };
  
  // Get payments for a registration
  const getPaymentsForRegistration = (registration: Registration): Payment[] => {
    return payments.filter(p => p.registrationId === registration.id);
  };

  // Get class name for payment status
  const getStatusClassName = (status: PaymentStatus): string => {
    switch (status) {
      case 'מלא':
        return 'bg-status-paid bg-opacity-20 text-green-800';
      case 'חלקי':
        return 'bg-status-partial bg-opacity-20 text-yellow-800';
      case 'הנחה':
        return 'bg-blue-100 bg-opacity-20 text-blue-800';
      case 'יתר':
        return 'bg-status-overdue bg-opacity-20 text-red-800';
      default:
        return '';
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
    resetForm,
    getParticipantForRegistration,
    getPaymentsForRegistration,
    getStatusClassName,
    calculatePaymentStatus,
  };
};
