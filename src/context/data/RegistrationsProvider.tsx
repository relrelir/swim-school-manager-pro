
import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';
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

  // Registrations functions with useCallback
  const addRegistration = useCallback(async (registration: Omit<Registration, 'id'>) => {
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
        setRegistrations(prevRegistrations => [...prevRegistrations, newRegistration]);
        return newRegistration;
      }
    } catch (error) {
      console.error('Error adding registration:', error);
    }
  }, []);

  const updateRegistration = useCallback(async (registration: Registration) => {
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

      setRegistrations(prevRegistrations => 
        prevRegistrations.map(r => r.id === registration.id ? registration : r)
      );
    } catch (error) {
      console.error('Error updating registration:', error);
    }
  }, []);

  const deleteRegistration = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('registrations')
        .delete()
        .eq('id', id);

      if (error) {
        handleSupabaseError(error, 'deleting registration');
      }

      setRegistrations(prevRegistrations => prevRegistrations.filter(r => r.id !== id));
    } catch (error) {
      console.error('Error deleting registration:', error);
    }
  }, []);

  const getRegistrationsByProduct = useCallback((productId: string) => {
    return registrations.filter(registration => registration.productId === productId);
  }, [registrations]);

  // Updated calculate payment status, properly accounting for discounts
  const calculatePaymentStatus = useCallback((registration: Registration, actualPaidAmount?: number): PaymentStatus => {
    // The discountAmount is the amount of discount applied to this registration
    const discountAmount = registration.discountAmount || 0;
    const paidWithoutDiscount = actualPaidAmount !== undefined ? actualPaidAmount : registration.paidAmount;
    
    // Calculate the effective amount that needs to be paid after discount
    const effectiveRequiredAmount = Math.max(0, registration.requiredAmount - (registration.discountApproved ? discountAmount : 0));
    
    if (registration.discountApproved) {
      if (paidWithoutDiscount >= effectiveRequiredAmount) {
        return 'מלא / הנחה' as PaymentStatus;
      }
      return 'חלקי / הנחה' as PaymentStatus;
    } else if (paidWithoutDiscount >= registration.requiredAmount) {
      if (paidWithoutDiscount > registration.requiredAmount) {
        return 'יתר' as PaymentStatus;
      }
      return 'מלא' as PaymentStatus;
    } else if (paidWithoutDiscount < registration.requiredAmount) {
      return 'חלקי' as PaymentStatus;
    }
    
    return 'מלא' as PaymentStatus;
  }, []);

  const contextValue = useMemo<RegistrationsContextType>(() => ({
    registrations,
    addRegistration,
    updateRegistration,
    deleteRegistration,
    getRegistrationsByProduct,
    calculatePaymentStatus,
    loading
  }), [
    registrations,
    addRegistration,
    updateRegistration,
    deleteRegistration,
    getRegistrationsByProduct,
    calculatePaymentStatus,
    loading
  ]);

  return (
    <RegistrationsContext.Provider value={contextValue}>
      {typeof children === 'function' ? children(contextValue) : children}
    </RegistrationsContext.Provider>
  );
};
