
import React, { createContext, useState, useContext, useEffect } from 'react';
import { PaymentStatus, Registration } from '@/types';
import { RegistrationsContextType } from './types';
import { generateId, loadData, saveData } from './utils';

const RegistrationsContext = createContext<RegistrationsContextType | null>(null);

export const useRegistrationsContext = () => {
  const context = useContext(RegistrationsContext);
  if (!context) {
    throw new Error('useRegistrationsContext must be used within a RegistrationsProvider');
  }
  return context;
};

export const RegistrationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [registrations, setRegistrations] = useState<Registration[]>(() => loadData('swimSchoolRegistrations', []));

  // Save data to localStorage whenever it changes
  useEffect(() => {
    saveData('swimSchoolRegistrations', registrations);
  }, [registrations]);

  // Registrations functions
  const addRegistration = (registration: Omit<Registration, 'id'>) => {
    const newRegistration = { ...registration, id: generateId() };
    setRegistrations([...registrations, newRegistration]);
  };

  const updateRegistration = (registration: Registration) => {
    setRegistrations(registrations.map(r => r.id === registration.id ? registration : r));
  };

  const deleteRegistration = (id: string) => {
    setRegistrations(registrations.filter(r => r.id !== id));
  };

  const getRegistrationsByProduct = (productId: string) => {
    return registrations.filter(registration => registration.productId === productId);
  };

  // Calculate payment status
  const calculatePaymentStatus = (registration: Registration): PaymentStatus => {
    if (registration.discountApproved || registration.paidAmount >= registration.requiredAmount) {
      if (registration.paidAmount > registration.requiredAmount) {
        return 'יתר';
      }
      return 'מלא';
    } else if (registration.paidAmount < registration.requiredAmount) {
      return 'חלקי';
    }
    return 'מלא';
  };

  const contextValue: RegistrationsContextType = {
    registrations,
    addRegistration,
    updateRegistration,
    deleteRegistration,
    getRegistrationsByProduct,
    calculatePaymentStatus,
  };

  return (
    <RegistrationsContext.Provider value={contextValue}>
      {children}
    </RegistrationsContext.Provider>
  );
};
