
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { toast } from '@/components/ui/use-toast';
import { Registration, Participant, Payment, RegistrationWithDetails } from '@/types';

export const useReportActions = () => {
  const { isAdmin } = useAuth();
  const { 
    getAllRegistrationsWithDetails,
    participants,
    updateParticipant,
    updateRegistration,
    updatePayment,
    deleteRegistration,
    addPayment
  } = useData();
  
  // Dialog states
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentRegistration, setCurrentRegistration] = useState<Registration | null>(null);
  const [editingRegistration, setEditingRegistration] = useState<Registration | null>(null);
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);
  const [editingPayments, setEditingPayments] = useState<Payment[]>([]);
  const [newPayment, setNewPayment] = useState({
    amount: 0,
    receiptNumber: '',
    paymentDate: new Date().toISOString().substring(0, 10),
  });
  
  const allRegistrations = getAllRegistrationsWithDetails();

  // Convert RegistrationWithDetails to Registration format for compatibility
  const convertToRegistration = (regWithDetails: RegistrationWithDetails): Registration => ({
    id: regWithDetails.id,
    productId: regWithDetails.product.id,
    participantId: regWithDetails.participant.id,
    requiredAmount: regWithDetails.requiredAmount,
    paidAmount: regWithDetails.paidAmount,
    discountApproved: regWithDetails.discountApproved,
    registrationDate: regWithDetails.registrationDate,
    discountAmount: regWithDetails.discountAmount,
    receiptNumber: regWithDetails.receiptNumber || '',
  });

  // Handler for opening add payment dialog
  const handleOpenAddPayment = (regWithDetails: RegistrationWithDetails) => {
    if (!isAdmin()) {
      toast({
        title: "אין הרשאה",
        description: "אין לך הרשאה להוסיף תשלומים",
        variant: "destructive",
      });
      return;
    }

    const registration = convertToRegistration(regWithDetails);
    setCurrentRegistration(registration);
    setNewPayment({
      amount: 0,
      receiptNumber: '',
      paymentDate: new Date().toISOString().substring(0, 10),
    });
    setIsAddPaymentOpen(true);
  };

  // Handler for deleting registration
  const handleDeleteRegistration = (registrationId: string) => {
    if (!isAdmin()) {
      toast({
        title: "אין הרשאה",
        description: "אין לך הרשאה למחוק רישומים",
        variant: "destructive",
      });
      return;
    }

    const regWithDetails = allRegistrations.find(r => r.id === registrationId);
    if (regWithDetails && regWithDetails.payments && regWithDetails.payments.length > 0) {
      toast({
        title: "לא ניתן למחוק",
        description: "לא ניתן למחוק רישום שבוצע עבורו תשלום",
        variant: "destructive",
      });
      return;
    }

    deleteRegistration(registrationId);
  };

  // Handler for editing participant
  const handleEditParticipant = (regWithDetails: RegistrationWithDetails) => {
    if (!isAdmin()) {
      toast({
        title: "אין הרשאה",
        description: "אין לך הרשאה לערוך משתתפים",
        variant: "destructive",
      });
      return;
    }

    const registration = convertToRegistration(regWithDetails);
    const participant = regWithDetails.participant;
    const payments = regWithDetails.payments || [];
    
    setEditingRegistration(registration);
    setEditingParticipant(participant);
    setEditingPayments(payments);
    setIsEditDialogOpen(true);
  };

  // Handler for updating participant
  const handleUpdateParticipant = async (
    registrationId: string,
    participantData: Partial<Participant>,
    registrationData: Partial<Registration>,
    paymentsData: Payment[]
  ) => {
    try {
      const regWithDetails = allRegistrations.find(r => r.id === registrationId);
      if (!regWithDetails) {
        toast({
          title: "שגיאה",
          description: "לא נמצא רישום מתאים",
          variant: "destructive",
        });
        return;
      }

      // Update participant data
      if (Object.keys(participantData).length > 0) {
        const fullParticipant = {
          ...regWithDetails.participant,
          ...participantData,
        } as Participant;
        
        await updateParticipant(fullParticipant);
      }

      // Update registration data
      if (Object.keys(registrationData).length > 0) {
        const registration = convertToRegistration(regWithDetails);
        const fullRegistration = {
          ...registration,
          ...registrationData,
        } as Registration;
        
        await updateRegistration(fullRegistration);
      }

      // Update payments data
      for (const payment of paymentsData) {
        await updatePayment(payment);
      }

      toast({
        title: "עודכן בהצלחה",
        description: "פרטי המשתתף עודכנו בהצלחה",
      });

    } catch (error) {
      console.error('Error updating participant:', error);
      toast({
        title: "שגיאה בעדכון",
        description: "אירעה שגיאה בעת עדכון פרטי המשתתף",
        variant: "destructive",
      });
    }
  };

  // Handler for saving participant edits
  const handleSaveParticipant = (
    participantData: Partial<Participant>,
    registrationData: Partial<Registration>,
    paymentsData: Payment[]
  ) => {
    if (editingRegistration) {
      handleUpdateParticipant(editingRegistration.id, participantData, registrationData, paymentsData);
    }
    
    setEditingRegistration(null);
    setEditingParticipant(null);
    setEditingPayments([]);
  };

  // Handler for adding payment
  const handleAddPayment = async () => {
    if (!currentRegistration) return;

    try {
      await addPayment({
        ...newPayment,
        registrationId: currentRegistration.id,
      });

      toast({
        title: "התשלום נוסף בהצלחה",
        description: `נוסף תשלום בסך ${newPayment.amount} ₪`,
      });

      setIsAddPaymentOpen(false);
      setNewPayment({
        amount: 0,
        receiptNumber: '',
        paymentDate: new Date().toISOString().substring(0, 10),
      });
    } catch (error) {
      toast({
        title: "שגיאה בהוספת התשלום",
        description: "אירעה שגיאה בעת הוספת התשלום",
        variant: "destructive",
      });
    }
  };

  return {
    // States
    isAddPaymentOpen,
    setIsAddPaymentOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    currentRegistration,
    editingRegistration,
    editingParticipant,
    editingPayments,
    newPayment,
    setNewPayment,
    
    // Handlers
    handleOpenAddPayment,
    handleDeleteRegistration,
    handleEditParticipant,
    handleSaveParticipant,
    handleAddPayment,
  };
};
