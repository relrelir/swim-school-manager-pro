
import { toast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { Payment } from '@/types';
import { handleSupabaseError, mapPaymentFromDB, mapPaymentToDB } from '../utils';

/**
 * Service layer for payment-related Supabase operations
 */
export const paymentsService = {
  /**
   * Fetch all payments from the database
   */
  fetchPayments: async (): Promise<Payment[]> => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .order('paymentdate', { ascending: true });

      if (error) {
        handleSupabaseError(error, 'fetching payments');
        return [];
      }

      const transformedPayments = data?.map(payment => mapPaymentFromDB(payment)) || [];
      console.log("Fetched payments:", transformedPayments);
      return transformedPayments;
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בטעינת תשלומים",
        variant: "destructive",
      });
      return [];
    }
  },

  /**
   * Add a new payment to the database
   */
  addPayment: async (payment: Omit<Payment, 'id'>): Promise<Payment | undefined> => {
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
  },

  /**
   * Update an existing payment
   */
  updatePayment: async (payment: Payment): Promise<boolean> => {
    try {
      const { id, ...paymentData } = payment;
      const dbPayment = mapPaymentToDB(paymentData);
      
      const { error } = await supabase
        .from('payments')
        .update(dbPayment)
        .eq('id', id);

      if (error) {
        handleSupabaseError(error, 'updating payment');
        return false;
      }
      
      return true;
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בעדכון תשלום",
        variant: "destructive",
      });
      return false;
    }
  },

  /**
   * Delete a payment by ID
   */
  deletePayment: async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('payments')
        .delete()
        .eq('id', id);

      if (error) {
        handleSupabaseError(error, 'deleting payment');
        return false;
      }
      
      return true;
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה במחיקת תשלום",
        variant: "destructive",
      });
      return false;
    }
  }
};
