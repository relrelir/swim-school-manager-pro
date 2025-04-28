
import React, { createContext, useState, useContext, useEffect } from 'react';
import { PaymentStatus, Registration } from '@/types';
import { RegistrationsContextType } from './types';
import { handleSupabaseError, mapRegistrationFromDB, mapRegistrationToDB } from './utils';
import { supabase } from '@/integrations/supabase/client';

const RegistrationsContext = createContext<RegistrationsContextType | null>(null);

export const useRegistrationsContext = () => {
  const context = useContext(RegistrationsContext);
  if (!context) {
    throw new Error('useRegistrationsContext must be used within a RegistrationsProvider');
  }
  return context;
};

interface RegistrationsProviderProps {
  children: React.ReactNode | ((context: RegistrationsContextType) => React.ReactNode);
}

export const RegistrationsProvider: React.FC<RegistrationsProviderProps> = ({ children }) => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  // Load registrations from Supabase
  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        const { data, error } = await supabase
          .from('registrations')
          .select('*');

        if (error) {
          handleSupabaseError(error, 'fetching registrations');
        }

        // Transform data to match our Registration type
        const transformedRegistrations: Registration[] = data?.map(registration => mapRegistrationFromDB(registration)) || [];

        setRegistrations(transformedRegistrations);
      } catch (error) {
        console.error('Error loading registrations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRegistrations();
  }, []);

  // Registrations functions
  const addRegistration = async (registration: Omit<Registration, 'id'>) => {
    try {
      const dbRegistration = mapRegistrationToDB(registration);

      const { data, error } = await supabase
        .from('registrations')
        .insert([dbRegistration])
        .select()
        .single();

      if (error) {
        handleSupabaseError(error, 'adding registration');
      }

      if (data) {
        const newRegistration = mapRegistrationFromDB(data);
        setRegistrations([...registrations, newRegistration]);
        return newRegistration;
      }
    } catch (error) {
      console.error('Error adding registration:', error);
    }
  };

  const updateRegistration = async (registration: Registration) => {
    try {
      const { id, ...registrationData } = registration;
      const dbRegistration = mapRegistrationToDB(registrationData);

      const { error } = await supabase
        .from('registrations')
        .update(dbRegistration)
        .eq('id', id);

      if (error) {
        handleSupabaseError(error, 'updating registration');
      }

      setRegistrations(registrations.map(r => r.id === registration.id ? registration : r));
    } catch (error) {
      console.error('Error updating registration:', error);
    }
  };

  const deleteRegistration = async (id: string) => {
    try {
      const { error } = await supabase
        .from('registrations')
        .delete()
        .eq('id', id);

      if (error) {
        handleSupabaseError(error, 'deleting registration');
      }

      setRegistrations(registrations.filter(r => r.id !== id));
    } catch (error) {
      console.error('Error deleting registration:', error);
    }
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
    loading
  };

  return (
    <RegistrationsContext.Provider value={contextValue}>
      {typeof children === 'function' ? children(contextValue) : children}
    </RegistrationsContext.Provider>
  );
};
