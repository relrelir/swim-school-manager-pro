
import { useState } from 'react';
import { toast } from "@/components/ui/use-toast";
import { Registration, Payment } from '@/types';

export const usePaymentHandlers = (
  addPayment: (payment: Omit<Payment, 'id'>) => void, 
  updateRegistration: (registration: Registration) => void, 
  getRegistrationsByProduct: (productId: string) => Registration[],
) => {
  const [currentRegistration, setCurrentRegistration] = useState<Registration | null>(null);

  // Handle adding a new payment
  const handleAddPayment = (e: React.FormEvent, 
                           newPayment: { amount: number; receiptNumber: string; paymentDate: string },
                           setIsAddPaymentOpen: (open: boolean) => void,
                           setNewPayment: React.Dispatch<React.SetStateAction<{
                             amount: number;
                             receiptNumber: string;
                             paymentDate: string;
                           }>>,
                           productId?: string,
                           registration?: Registration | null) => {
    
    // Use the provided registration parameter if available, otherwise use currentRegistration state
    const registrationToUpdate = registration || currentRegistration;
    
    if (registrationToUpdate) {
      // Check if receipt number is provided
      if (!newPayment.receiptNumber) {
        toast({
          title: "שגיאה",
          description: "מספר קבלה הוא שדה חובה",
          variant: "destructive",
        });
        return [];
      }
      
      // Add the new payment
      const payment: Omit<Payment, 'id'> = {
        registrationId: registrationToUpdate.id,
        amount: newPayment.amount,
        receiptNumber: newPayment.receiptNumber,
        paymentDate: newPayment.paymentDate,
      };
      
      addPayment(payment);
      
      // Update the registration's paidAmount
      const updatedPaidAmount = registrationToUpdate.paidAmount + newPayment.amount;
      
      const updatedRegistration: Registration = {
        ...registrationToUpdate,
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
        return getRegistrationsByProduct(productId);
      }
    } else {
      // No registration selected
      toast({
        title: "שגיאה",
        description: "לא נבחר משתתף להוספת תשלום",
        variant: "destructive",
      });
    }
    
    return [];
  };

  // Handle applying a discount
  const handleApplyDiscount = (
    discountAmount: number, 
    setIsAddPaymentOpen: (open: boolean) => void,
    productId?: string,
    registration?: Registration | null
  ) => {
    // Use the provided registration parameter if available, otherwise use currentRegistration state
    const registrationToUpdate = registration || currentRegistration;
    
    if (registrationToUpdate) {
      // Update the registration with discount
      const updatedRegistration: Registration = {
        ...registrationToUpdate,
        discountApproved: true,
        discountAmount: (registrationToUpdate.discountAmount || 0) + discountAmount,
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
        return getRegistrationsByProduct(productId);
      }
    } else {
      // No registration selected
      toast({
        title: "שגיאה",
        description: "לא נבחר משתתף להוספת הנחה",
        variant: "destructive",
      });
    }
    
    return [];
  };

  return {
    currentRegistration,
    setCurrentRegistration,
    handleAddPayment,
    handleApplyDiscount
  };
};
