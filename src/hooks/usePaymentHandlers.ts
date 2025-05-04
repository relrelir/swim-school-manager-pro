
import { useState } from 'react';
import { toast } from "@/components/ui/use-toast";
import { Registration, Payment } from '@/types';

export const usePaymentHandlers = (
  addPayment: (payment: Omit<Payment, 'id'>) => void, 
  updateRegistration: (registration: Registration) => void, 
  getRegistrationsByProduct: (productId: string) => Registration[],
  initialCurrentRegistration: Registration | null = null 
) => {
  const [currentRegistration, setCurrentRegistration] = useState<Registration | null>(initialCurrentRegistration);

  // Handle adding a new payment
  const handleAddPayment = (
    e: React.FormEvent, 
    newPayment: { amount: number; receiptNumber: string; paymentDate: string },
    setIsAddPaymentOpen: (open: boolean) => void,
    setNewPayment: React.Dispatch<React.SetStateAction<{
      amount: number;
      receiptNumber: string;
      paymentDate: string;
    }>>,
    productId?: string
  ) => {
    // Prevent default form submission
    e.preventDefault();
    
    // Log current state for debugging
    console.log("usePaymentHandlers.handleAddPayment called with registration:", currentRegistration);
    
    if (!currentRegistration) {
      console.error("Error: currentRegistration is null in usePaymentHandlers.handleAddPayment");
      toast({
        title: "שגיאה",
        description: "לא נבחר משתתף לתשלום",
        variant: "destructive",
      });
      return [];
    }
    
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
    
    // Show success message
    toast({
      title: "תשלום נוסף בהצלחה",
      description: `תשלום בסך ${Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(newPayment.amount)} נוסף בהצלחה`,
    });
    
    // Refresh registrations list
    if (productId) {
      return getRegistrationsByProduct(productId);
    }
    
    return [];
  };

  // Handle applying a discount
  const handleApplyDiscount = (
    discountAmount: number, 
    setIsAddPaymentOpen: (open: boolean) => void,
    productId?: string
  ) => {
    console.log("usePaymentHandlers.handleApplyDiscount called with registration:", currentRegistration);
    
    if (!currentRegistration) {
      console.error("Error: currentRegistration is null in usePaymentHandlers.handleApplyDiscount");
      toast({
        title: "שגיאה",
        description: "לא נבחר משתתף להנחה",
        variant: "destructive",
      });
      return [];
    }
    
    // Update the registration with discount
    const updatedRegistration: Registration = {
      ...currentRegistration,
      discountApproved: true,
      discountAmount: (currentRegistration.discountAmount || 0) + discountAmount,
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
    
    return [];
  };

  return {
    currentRegistration,
    setCurrentRegistration,
    handleAddPayment,
    handleApplyDiscount
  };
};
