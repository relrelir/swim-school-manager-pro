
import { useState, useEffect } from 'react';
import { Payment } from '@/types';
import { paymentsService } from './paymentsService';

/**
 * Hook to handle payment state
 */
export const usePaymentsState = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch payments on component mount
  useEffect(() => {
    fetchPayments();
  }, []);

  /**
   * Fetch payments from the database
   */
  const fetchPayments = async () => {
    setLoading(true);
    const fetchedPayments = await paymentsService.fetchPayments();
    setPayments(fetchedPayments);
    setLoading(false);
    return fetchedPayments;
  };

  /**
   * Function to refresh payments data
   */
  const refreshPayments = async (): Promise<void> => {
    console.log("Refreshing payments data");
    await fetchPayments();
    console.log("Payments refreshed, total payments:", payments.length);
  };

  /**
   * Add a new payment
   */
  const addPayment = async (payment: Omit<Payment, 'id'>) => {
    const newPayment = await paymentsService.addPayment(payment);
    
    if (newPayment) {
      // Update local state immediately with the new payment
      setPayments(prevPayments => [...prevPayments, newPayment]);
      
      // Immediately refresh payments to ensure UI is updated with fresh data
      await refreshPayments();
    }
    
    return newPayment;
  };

  /**
   * Update an existing payment
   */
  const updatePayment = async (payment: Payment) => {
    const success = await paymentsService.updatePayment(payment);
    
    if (success) {
      // Update local state
      setPayments(prevPayments => prevPayments.map(p => p.id === payment.id ? payment : p));
      
      // Refresh to ensure consistent state
      await refreshPayments();
    }
  };

  /**
   * Delete a payment by ID
   */
  const deletePayment = async (id: string) => {
    const success = await paymentsService.deletePayment(id);
    
    if (success) {
      // Update local state
      setPayments(prevPayments => prevPayments.filter(p => p.id !== id));
      
      // Refresh to ensure consistent state
      await refreshPayments();
    }
  };

  /**
   * Get payments for a specific registration
   */
  const getPaymentsByRegistration = async (registrationId: string): Promise<Payment[]> => {
    // Refresh payments first to ensure we have the latest data
    await refreshPayments();
    
    // Now filter the refreshed payments
    const registrationPayments = payments.filter(payment => payment.registrationId === registrationId);
    console.log(`Getting ${registrationPayments.length} payments for registration ${registrationId}`);
    return registrationPayments;
  };

  return {
    payments,
    loading,
    addPayment,
    updatePayment,
    deletePayment,
    getPaymentsByRegistration,
    refreshPayments
  };
};
