
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

export const useReportAccess = () => {
  const [isAccessDialogOpen, setIsAccessDialogOpen] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const { isAdmin } = useAuth();
  
  // Check if user has access to reports
  useEffect(() => {
    // Admins always have access
    if (isAdmin()) {
      setHasAccess(true);
      return;
    }
    
    // Check if viewer has entered the access code during this session
    const hasEnteredCode = sessionStorage.getItem('reportAccessGranted') === 'true';
    setHasAccess(hasEnteredCode);
    
    // If viewer hasn't entered the code yet, show the dialog
    if (!hasEnteredCode) {
      setIsAccessDialogOpen(true);
    }
  }, [isAdmin]);
  
  const handleAccessSuccess = () => {
    setHasAccess(true);
    setIsAccessDialogOpen(false);
  };
  
  return {
    hasAccess,
    isAccessDialogOpen,
    setIsAccessDialogOpen,
    handleAccessSuccess,
  };
};
