
import { useState, useEffect, useCallback } from 'react';
import { Registration } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { useRegistrationsContext } from '@/context/data/RegistrationsProvider';

export const useRegistrations = () => {
  const {
    registrations,
    addRegistration,
    updateRegistration,
    deleteRegistration,
    getRegistrationsByProduct,
    calculatePaymentStatus,
    loading
  } = useRegistrationsContext();

  return {
    registrations,
    addRegistration,
    updateRegistration,
    deleteRegistration,
    getRegistrationsByProduct,
    calculatePaymentStatus,
    loading
  };
};
