
import { useState } from 'react';
import { toast } from "@/components/ui/use-toast";
import { Registration, Payment } from '@/types';

export const usePaymentHandlers = (
  addPayment: (payment: Omit<Payment, 'id'>) => Promise<Payment | undefined> | void, 
  updateRegistration: (registration: Registration) => void, 
  getRegistrationsByProduct: (productId: string) => Registration[],
) => {
  const [currentRegistration, setCurrentRegistration] = useState<Registration | null>(null);

  // Handle adding a new payment
  const handleAddPayment = async (
    e: React.FormEvent, 
    newPayment: { 
      amount: number; 
      receiptNumber: string; 
      paymentDate: string;
      registrationId?: string; 
    },
    setIsAddPaymentOpen: (open: boolean) => void,
    setNewPayment: React.Dispatch<React.SetStateAction<{
      amount: number;
      receiptNumber: string;
      paymentDate: string;
      registrationId?: string; 
    }>>,
    productId?: string
  ): Promise<Registration[]> => {
    e.preventDefault();
    
    console.log("Adding new payment:", newPayment);
    
    // Check if receipt number is provided
    if (!newPayment.receiptNumber || newPayment.receiptNumber.trim() === '') {
      toast({
        title: "שגיאה",
        description: "מספר קבלה הוא שדה חובה",
        variant: "destructive",
      });
      return [];
    }
    
    // Check if registrationId is provided
    if (!newPayment.registrationId && !currentRegistration?.id) {
      toast({
        title: "שגיאה",
        description: "שגיאת מערכת: מזהה הרישום חסר",
        variant: "destructive",
      });
      return [];
    }

    // Use registrationId from newPayment if provided, otherwise use currentRegistration.id
    const registrationId = newPayment.registrationId || currentRegistration?.id;
    
    if (!registrationId) {
      console.error("No registration ID available");
      return [];
    }

    // Add the new payment
    const payment: Omit<Payment, 'id'> = {
      registrationId: registrationId,
      amount: newPayment.amount,
      receiptNumber: newPayment.receiptNumber,
      paymentDate: newPayment.paymentDate,
    };
    
    console.log("Adding payment:", payment);
    const addedPayment = await addPayment(payment);
    console.log("Payment added:", addedPayment);
    
    // Update the registration's paidAmount
    let updatedRegistrations: Registration[] = [];
    if (productId) {
      const regs = getRegistrationsByProduct(productId);
      const reg = regs.find(r => r.id === registrationId);
      
      if (reg) {
        const updatedPaidAmount = reg.paidAmount + newPayment.amount;
        console.log(`Updating registration ${reg.id} paidAmount from ${reg.paidAmount} to ${updatedPaidAmount}`);
        
        const updatedReg: Registration = {
          ...reg,
          paidAmount: updatedPaidAmount,
        };
        
        await updateRegistration(updatedReg);
        console.log("Registration updated with new payment amount:", updatedReg);
      } else {
        console.error(`Registration with id ${registrationId} not found in product ${productId}`);
      }
      
      // Get fresh registrations after update
      updatedRegistrations = getRegistrationsByProduct(productId);
      console.log("Updated registrations after adding payment:", updatedRegistrations);
    }
    
    // Reset form and close dialog
    setIsAddPaymentOpen(false);
    setNewPayment({
      amount: 0,
      receiptNumber: '',
      paymentDate: new Date().toISOString().substring(0, 10),
      registrationId: undefined,
    });
    
    toast({
      title: "תשלום נוסף בהצלחה",
      description: `תשלום בסך ${newPayment.amount} ₪ נוסף בהצלחה`,
    });
    
    return updatedRegistrations;
  };

  // Handle applying a discount
  const handleApplyDiscount = async (
    discountAmount: number, 
    setIsAddPaymentOpen: (open: boolean) => void,
    productId?: string,
    registrationId?: string // Add registrationId parameter
  ): Promise<Registration[]> => {
    // Check if we have a registration ID
    if (!registrationId && !currentRegistration?.id) {
      toast({
        title: "שגיאה",
        description: "שגיאת מערכת: מזהה הרישום חסר",
        variant: "destructive",
      });
      return [];
    }
    
    // Get the registration from either the parameter or current state
    let targetRegistration: Registration | null = null;
    
    if (registrationId && productId) {
      const regs = getRegistrationsByProduct(productId);
      targetRegistration = regs.find(r => r.id === registrationId) || null;
    } else {
      targetRegistration = currentRegistration;
    }
    
    if (targetRegistration) {
      // Update the registration with discount
      const updatedRegistration: Registration = {
        ...targetRegistration,
        discountApproved: true,
        discountAmount: (targetRegistration.discountAmount || 0) + discountAmount,
      };
      
      console.log(`Applying discount of ${discountAmount} to registration ${targetRegistration.id}`);
      await updateRegistration(updatedRegistration);
      console.log("Discount applied successfully");
      
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
