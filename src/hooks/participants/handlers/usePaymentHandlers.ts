
import { toast } from '@/components/ui/use-toast';
import { Registration } from '@/types';

export const usePaymentHandlers = (
  currentRegistration: Registration | null,
  dataContext: any,
  setIsAddPaymentOpen: (open: boolean) => void,
  setRefreshTrigger: (value: React.SetStateAction<number>) => void,
  newPayment: any,
  setNewPayment: React.Dispatch<React.SetStateAction<any>>
) => {
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

  // Apply discount handler
  const handleApplyDiscount = async (
    amount: number, 
    setIsAddPaymentOpenFn: (open: boolean) => void, 
    registrationId?: string
  ) => {
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
    handleAddPayment,
    handleApplyDiscount
  };
};
