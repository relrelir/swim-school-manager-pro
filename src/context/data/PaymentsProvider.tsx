
import React, { createContext, useState, useContext, useEffect } from 'react';
import { Payment } from '@/types';
import { toast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { handleSupabaseError } from './utils';

interface PaymentsContextType {
  payments: Payment[];
  addPayment: (payment: Omit<Payment, 'id'>) => Promise<Payment | undefined>;
  updatePayment: (payment: Payment) => Promise<void>;
  deletePayment: (id: string) => Promise<void>;
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

export const PaymentsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

        if (data) {
          const transformedPayments: Payment[] = data.map(payment => ({
            id: payment.id,
            registrationId: payment.registrationid,
            amount: payment.amount,
            paymentDate: payment.paymentdate,
            receiptNumber: payment.receiptnumber,
          }));
          setPayments(transformedPayments);
        }
      } catch (error) {
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

  // Add a payment
  const addPayment = async (payment: Omit<Payment, 'id'>): Promise<Payment | undefined> => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .insert([{
          registrationid: payment.registrationId,
          amount: payment.amount,
          paymentdate: payment.paymentDate,
          receiptnumber: payment.receiptNumber,
        }])
        .select()
        .single();

      if (error) {
        handleSupabaseError(error, 'adding payment');
        return undefined;
      }

      if (data) {
        const newPayment: Payment = {
          id: data.id,
          registrationId: data.registrationid,
          amount: data.amount,
          paymentDate: data.paymentdate,
          receiptNumber: data.receiptnumber,
        };
        setPayments([...payments, newPayment]);
        return newPayment;
      }
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בהוספת תשלום",
        variant: "destructive",
      });
    }
    return undefined;
  };

  // Update a payment
  const updatePayment = async (payment: Payment) => {
    try {
      const { error } = await supabase
        .from('payments')
        .update({
          registrationid: payment.registrationId,
          amount: payment.amount,
          paymentdate: payment.paymentDate,
          receiptnumber: payment.receiptNumber,
        })
        .eq('id', payment.id);

      if (error) {
        handleSupabaseError(error, 'updating payment');
      }

      setPayments(payments.map(p => p.id === payment.id ? payment : p));
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בעדכון תשלום",
        variant: "destructive",
      });
    }
  };

  // Delete a payment
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
      console.error("Error deleting payment:", error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה במחיקת תשלום",
        variant: "destructive",
      });
    }
  };

  // Get payments by registration ID
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
