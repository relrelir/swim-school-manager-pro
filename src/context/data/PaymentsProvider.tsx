
import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from "@/components/ui/use-toast";
import { Payment } from '@/types';
import { handleSupabaseError, mapPaymentFromDB, mapPaymentToDB } from './utils';
import { supabase } from '@/integrations/supabase/client';

interface PaymentsContextType {
  payments: Payment[];
  addPayment: (payment: Omit<Payment, 'id'>) => Promise<Payment | undefined>;
  updatePayment: (payment: Payment) => void;
  deletePayment: (id: string) => void;
  getPaymentsByRegistration: (registrationId: string) => Payment[];
  refreshPayments: () => Promise<void>;
  loading: boolean;
}

const PaymentsContext = createContext<PaymentsContextType | null>(null);

export const usePaymentsContext = () => {
  const context = useContext(PaymentsContext);
  if (!context) {
    throw new Error('usePaymentsContext must be used within a PaymentsProvider');
  }
  return context;
};

interface PaymentsProviderProps {
  children: React.ReactNode;
}

export const PaymentsProvider: React.FC<PaymentsProviderProps> = ({ children }) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch payments from database
  const fetchPayments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('payments')
        .select('*');

      if (error) {
        handleSupabaseError(error, 'fetching payments');
      }

      const transformedPayments = data?.map(payment => mapPaymentFromDB(payment)) || [];
      console.log("Fetched payments:", transformedPayments);
      setPayments(transformedPayments);
      return transformedPayments;
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בטעינת תשלומים",
        variant: "destructive",
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Load payments on component mount
  useEffect(() => {
    fetchPayments();
  }, []);

  // Function to refresh payments data
  const refreshPayments = async () => {
    console.log("Refreshing payments data");
    await fetchPayments();
    console.log("Payments refreshed:", payments.length);
    return;
  };

  const addPayment = async (payment: Omit<Payment, 'id'>) => {
    try {
      // Validate the payment data
      if (!payment.receiptNumber || payment.receiptNumber.trim() === '') {
        console.error("Receipt number is required for payments");
        toast({
          title: "שגיאה",
          description: "מספר קבלה הוא שדה חובה",
          variant: "destructive",
        });
        return;
      }
      
      if (!payment.registrationId) {
        console.error("Registration ID is missing from payment");
        toast({
          title: "שגיאה",
          description: "מזהה רישום חסר בתשלום",
          variant: "destructive",
        });
        return;
      }
      
      console.log("Adding payment:", payment);
      
      const dbPayment = mapPaymentToDB(payment);
      console.log("Mapped payment for DB:", dbPayment);
      
      const { data, error } = await supabase
        .from('payments')
        .insert([dbPayment])
        .select()
        .single();

      if (error) {
        handleSupabaseError(error, 'adding payment');
        return;
      }

      if (data) {
        const newPayment = mapPaymentFromDB(data);
        console.log("Payment added successfully:", newPayment);
        
        // Update local state immediately with the new payment
        setPayments(prevPayments => [...prevPayments, newPayment]);
        
        // Immediately refresh payments to ensure UI is updated with fresh data
        await refreshPayments();
        
        return newPayment;
      }
    } catch (error) {
      console.error("Error adding payment:", error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בהוספת תשלום חדש",
        variant: "destructive",
      });
    }
  };

  const updatePayment = async (payment: Payment) => {
    try {
      const { id, ...paymentData } = payment;
      const dbPayment = mapPaymentToDB(paymentData);
      
      const { error } = await supabase
        .from('payments')
        .update(dbPayment)
        .eq('id', id);

      if (error) {
        handleSupabaseError(error, 'updating payment');
      }

      setPayments(payments.map(p => p.id === payment.id ? payment : p));
      
      // Refresh to ensure consistent state
      await refreshPayments();
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בעדכון תשלום",
        variant: "destructive",
      });
    }
  };

  const deletePayment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('payments')
        .delete()
        .eq('id', id);

      if (error) {
        handleSupabaseError(error, 'deleting payment');
      }

      setPayments(payments.filter(p => p.id !== id));
      
      // Refresh to ensure consistent state
      await refreshPayments();
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה במחיקת תשלום",
        variant: "destructive",
      });
    }
  };

  const getPaymentsByRegistration = (registrationId: string) => {
    const registrationPayments = payments.filter(payment => payment.registrationId === registrationId);
    console.log(`Getting payments for registration ${registrationId}:`, registrationPayments);
    return registrationPayments;
  };

  const contextValue: PaymentsContextType = {
    payments,
    addPayment,
    updatePayment,
    deletePayment,
    getPaymentsByRegistration,
    refreshPayments,
    loading
  };

  return (
    <PaymentsContext.Provider value={contextValue}>
      {children}
    </PaymentsContext.Provider>
  );
};
