
import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from "@/components/ui/use-toast";
import { Payment } from '@/types';
import { generateId, loadData, saveData } from './utils';

interface PaymentsContextType {
  payments: Payment[];
  addPayment: (payment: Omit<Payment, 'id'>) => void;
  updatePayment: (payment: Payment) => void;
  deletePayment: (id: string) => void;
  getPaymentsByRegistration: (registrationId: string) => Payment[];
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
  const [payments, setPayments] = useState<Payment[]>(() => loadData('swimSchoolPayments', []));

  // Save data to localStorage whenever it changes
  useEffect(() => {
    saveData('swimSchoolPayments', payments);
  }, [payments]);

  // Payments functions
  const addPayment = (payment: Omit<Payment, 'id'>) => {
    const newPayment = { ...payment, id: generateId() };
    setPayments([...payments, newPayment]);
  };

  const updatePayment = (payment: Payment) => {
    setPayments(payments.map(p => p.id === payment.id ? payment : p));
  };

  const deletePayment = (id: string) => {
    setPayments(payments.filter(p => p.id !== id));
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
  };

  return (
    <PaymentsContext.Provider value={contextValue}>
      {children}
    </PaymentsContext.Provider>
  );
};
