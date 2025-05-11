
import { Registration, Participant } from '@/types';
import { toast } from '@/components/ui/use-toast';

export const useParticipantHandlers = (
  productId: string | undefined,
  dataContext: any,
  setIsAddParticipantOpen: (open: boolean) => void,
  setIsAddPaymentOpen: (open: boolean) => void,
  setRefreshTrigger: (value: React.SetStateAction<number>) => void,
  resetForm: () => void,
  currentRegistration: Registration | null,
  newParticipant: Omit<Participant, 'id'>,
  registrationData: any,
  newPayment: any,
  setCurrentHealthDeclaration: React.Dispatch<React.SetStateAction<any>>,
  setNewPayment: React.Dispatch<React.SetStateAction<any>>,
  addParticipant: (participant: Omit<Participant, 'id'>) => Promise<Participant | undefined>,
  updateParticipant: (participant: Participant) => void
) => {
  // Add participant handler
  const handleAddParticipant = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!productId) return;
    
    // Validation
    if (!newParticipant.firstName || !newParticipant.lastName || 
        !newParticipant.idNumber || !newParticipant.phone || 
        !registrationData.receiptNumber) {
      toast({
        variant: "destructive",
        title: "שגיאה",
        description: "יש למלא את כל השדות הנדרשים",
      });
      return;
    }
    
    try {
      // Add participant first
      const participant = await addParticipant(newParticipant);
      
      if (participant) {
        // Then add registration
        const newRegistration: Omit<Registration, 'id'> = {
          productId,
          participantId: participant.id,
          requiredAmount: registrationData.requiredAmount,
          paidAmount: registrationData.paidAmount,
          receiptNumber: registrationData.receiptNumber,
          discountApproved: registrationData.discountApproved,
          registrationDate: new Date().toISOString(),
        };
        
        await dataContext.addRegistration(newRegistration);
        
        // Add initial payment if needed
        if (registrationData.paidAmount > 0) {
          // Get the new registration to get its ID
          const updatedRegs = dataContext.getRegistrationsByProduct(productId);
          const addedRegistration = updatedRegs.find(
            (r: Registration) => r.participantId === participant.id && r.productId === productId
          );
          
          if (addedRegistration) {
            await dataContext.addPayment({
              registrationId: addedRegistration.id,
              amount: registrationData.paidAmount,
              receiptNumber: registrationData.receiptNumber,
              paymentDate: new Date().toISOString()
            });
          }
        }
        
        toast({
          title: "נרשם בהצלחה",
          description: `${participant.firstName} ${participant.lastName} נרשם בהצלחה`,
        });
        
        // Reset form and close dialog
        resetForm();
        setIsAddParticipantOpen(false);
        
        // Trigger refresh
        setRefreshTrigger(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error adding participant:', error);
      toast({
        variant: "destructive",
        title: "שגיאה",
        description: "אירעה שגיאה בהוספת המשתתף",
      });
    }
  };

  // Add payment handler
  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentRegistration) return;
    
    try {
      // Validate payment data
      if (newPayment.amount <= 0 || !newPayment.receiptNumber || !newPayment.paymentDate) {
        toast({
          variant: "destructive",
          title: "שגיאה",
          description: "יש למלא את כל שדות התשלום",
        });
        return;
      }
      
      // Add the payment
      await dataContext.addPayment({
        registrationId: currentRegistration.id,
        amount: newPayment.amount,
        receiptNumber: newPayment.receiptNumber,
        paymentDate: newPayment.paymentDate
      });
      
      toast({
        title: "תשלום נוסף בהצלחה",
        description: `תשלום בסך ${newPayment.amount} ש"ח נוסף בהצלחה`,
      });
      
      // Reset and close
      setNewPayment({
        amount: 0,
        receiptNumber: '',
        paymentDate: new Date().toISOString().split('T')[0]
      });
      
      setIsAddPaymentOpen(false);
      setRefreshTrigger(prev => prev + 1);
      
    } catch (error) {
      console.error('Error adding payment:', error);
      toast({
        variant: "destructive",
        title: "שגיאה",
        description: "אירעה שגיאה בהוספת התשלום",
      });
    }
  };

  // Delete registration handler
  const handleDeleteRegistration = async (id: string) => {
    try {
      // Delete all payments associated with this registration first
      const paymentsToDelete = dataContext.getPaymentsByRegistration(id);
      for (const payment of paymentsToDelete) {
        await dataContext.deletePayment(payment.id);
      }
      
      // Then delete the registration
      await dataContext.deleteRegistration(id);
      
      toast({
        title: "נמחק בהצלחה",
        description: "הרישום נמחק בהצלחה",
      });
      
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error deleting registration:', error);
      toast({
        variant: "destructive",
        title: "שגיאה",
        description: "אירעה שגיאה במחיקת הרישום",
      });
    }
  };

  // Update health approval handler
  const handleUpdateHealthApproval = async (registrationId: string, isApproved: boolean) => {
    try {
      // Find the registration
      const registration = dataContext.registrations.find((r: Registration) => r.id === registrationId);
      
      if (registration) {
        // Find the participant
        const participant = dataContext.participants.find((p: Participant) => p.id === registration.participantId);
        
        if (participant) {
          // Update the participant's health approval status
          const updatedParticipant = {
            ...participant,
            healthApproval: isApproved
          };
          
          await updateParticipant(updatedParticipant);
          
          toast({
            title: "עודכן בהצלחה",
            description: `סטטוס הצהרת הבריאות עודכן ל${isApproved ? 'אושר' : 'לא אושר'}`,
          });
          
          setRefreshTrigger(prev => prev + 1);
        }
      }
    } catch (error) {
      console.error('Error updating health approval:', error);
      toast({
        variant: "destructive",
        title: "שגיאה",
        description: "אירעה שגיאה בעדכון סטטוס הצהרת הבריאות",
      });
    }
  };

  // Open health form handler
  const handleOpenHealthForm = async (registrationId: string) => {
    try {
      // Find the registration
      const registration = dataContext.registrations.find((r: Registration) => r.id === registrationId);
      
      if (registration) {
        // Find the participant
        const participant = dataContext.participants.find((p: Participant) => p.id === registration.participantId);
        
        if (participant) {
          // Get the health declaration for this registration
          const declaration = await dataContext.getHealthDeclarationForRegistration(registrationId);
          
          // Set the current health declaration
          setCurrentHealthDeclaration({
            registrationId,
            participantName: `${participant.firstName} ${participant.lastName}`,
            phone: participant.phone,
            declaration
          });
        }
      }
    } catch (error) {
      console.error('Error opening health form:', error);
      toast({
        variant: "destructive",
        title: "שגיאה",
        description: "אירעה שגיאה בפתיחת טופס הצהרת הבריאות",
      });
    }
  };

  // Apply discount handler
  const handleApplyDiscount = (amount: number, setIsAddPaymentOpenFn: (open: boolean) => void, registrationId?: string) => {
    if (!productId) return;
    
    try {
      // Use the registration ID from params if provided, otherwise use the current registration
      const targetRegistrationId = registrationId || currentRegistration?.id;
      
      if (!targetRegistrationId) {
        toast({
          variant: "destructive",
          title: "שגיאה",
          description: "לא נמצא רישום להחלת ההנחה",
        });
        return;
      }
      
      // Find the registration to update
      const registration = dataContext.registrations.find((r: Registration) => r.id === targetRegistrationId);
      
      if (registration) {
        // Create an updated registration with the discount
        const updatedRegistration = {
          ...registration,
          discountApproved: true,
          discountAmount: amount
        };
        
        // Update the registration
        dataContext.updateRegistration(updatedRegistration);
        
        toast({
          title: "הנחה הוחלה בהצלחה",
          description: `הנחה בסך ${amount} ש"ח הוחלה בהצלחה`,
        });
        
        // Close dialog and refresh data
        setIsAddPaymentOpenFn(false);
        setRefreshTrigger(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error applying discount:', error);
      toast({
        variant: "destructive",
        title: "שגיאה",
        description: "אירעה שגיאה בהחלת ההנחה",
      });
    }
  };

  return {
    handleAddParticipant,
    handleAddPayment,
    handleDeleteRegistration,
    handleUpdateHealthApproval,
    handleOpenHealthForm,
    handleApplyDiscount
  };
};
