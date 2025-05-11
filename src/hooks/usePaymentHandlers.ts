
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
      registrationId?: string; // Added registrationId field
    },
    setIsAddPaymentOpen: (open: boolean) => void,
    setNewPayment: React.Dispatch<React.SetStateAction<{
      amount: number;
      receiptNumber: string;
      paymentDate: string;
      registrationId?: string; // Added registrationId field
    }>>,
    productId?: string
  ): Promise<Registration[]> => {
    // Check if receipt number is provided
    if (!newPayment.receiptNumber) {
      toast({
        title: "שגיאה",
        description: "מספר קבלה הוא שדה חובה",
        variant: "destructive",
      });
      return [];
    }
    
    // Check if registrationId is provided
    if (!newPayment.registrationId) {
      toast({
        title: "שגיאה",
        description: "שגיאת מערכת: מזהה הרישום חסר",
        variant: "destructive",
      });
      return [];
    }

    // Add the new payment
    const payment: Omit<Payment, 'id'> = {
      registrationId: newPayment.registrationId,
      amount: newPayment.amount,
      receiptNumber: newPayment.receiptNumber,
      paymentDate: newPayment.paymentDate,
    };
    
    await addPayment(payment);
    
    // Update the registration's paidAmount
    let updatedRegistrations: Registration[] = [];
    if (productId) {
      const regs = getRegistrationsByProduct(productId);
      const reg = regs.find(r => r.id === newPayment.registrationId);
      if (reg) {
        const updatedPaidAmount = reg.paidAmount + newPayment.amount;
        const updatedReg: Registration = {
          ...reg,
          paidAmount: updatedPaidAmount,
        };
        updateRegistration(updatedReg);
      }
      updatedRegistrations = regs;
    }
    
    // Reset form and close dialog
    setIsAddPaymentOpen(false);
    setNewPayment({
      amount: 0,
      receiptNumber: '',
      paymentDate: new Date().toISOString().substring(0, 10),
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
    if (!registrationId && !currentRegistration) {
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
