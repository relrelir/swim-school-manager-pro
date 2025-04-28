
import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from "@/components/ui/use-toast";
import { Payment } from '@/types';
import { generateId, handleSupabaseError } from './utils';
import { supabase } from '@/integrations/supabase/client';

interface PaymentsContextType {
  payments: Payment[];
  addPayment: (payment: Omit<Payment, 'id'>) => Promise<Payment | undefined>;
  updatePayment: (payment: Payment) => void;
  deletePayment: (id: string) => void;
  getPaymentsByRegistration: (registrationId: string) => Payment[];
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

  // Load payments from Supabase
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const { data, error } = await supabase
          .from('payments')
          .select('*');

        if (error) {
          handleSupabaseError(error, 'fetching payments');
        }

        // Transform data to match our Payment type
        const transformedPayments: Payment[] = data?.map(payment => ({
          id: payment.id,
          registrationId: payment.registrationId,
          amount: Number(payment.amount),
          receiptNumber: payment.receiptNumber,
          paymentDate: payment.paymentDate,
        })) || [];

        setPayments(transformedPayments);
      } catch (error) {
        console.error('Error loading payments:', error);
        toast({
          title: "שגיאה",
          description: "אירעה שגיאה בטעינת תשלומים",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  // Payments functions
  const addPayment = async (payment: Omit<Payment, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .insert([payment])
        .select()
        .single();

      if (error) {
        handleSupabaseError(error, 'adding payment');
      }

      if (data) {
        const newPayment: Payment = {
          id: data.id,
          registrationId: data.registrationId,
          amount: Number(data.amount),
          receiptNumber: data.receiptNumber,
          paymentDate: data.paymentDate,
        };
        setPayments([...payments, newPayment]);
        return newPayment;
      }
    } catch (error) {
      console.error('Error adding payment:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בהוספת תשלום חדש",
        variant: "destructive",
      });
    }
  };

  const updatePayment = async (payment: Payment) => {
    try {
      const { error } = await supabase
        .from('payments')
        .update({
          registrationId: payment.registrationId,
          amount: payment.amount,
          receiptNumber: payment.receiptNumber,
          paymentDate: payment.paymentDate,
        })
        .eq('id', payment.id);

      if (error) {
        handleSupabaseError(error, 'updating payment');
      }

      setPayments(payments.map(p => p.id === payment.id ? payment : p));
    } catch (error) {
      console.error('Error updating payment:', error);
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
    } catch (error) {
      console.error('Error deleting payment:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה במחיקת תשלום",
        variant: "destructive",
      });
    }
  };

  const getPaymentsByRegistration = (registrationId: string) => {
    return payments.filter(payment => payment.registrationId === registrationId);
  };

  const contextValue: PaymentsContextType = {
    payments,
    addPayment,
    updatePayment,
    deletePayment,
    getPaymentsByRegistration,
    loading
  };

  return (
    <PaymentsContext.Provider value={contextValue}>
      {children}
    </PaymentsContext.Provider>
  );
};
