
import React, { createContext, useContext } from 'react';
import { HealthDeclaration } from '@/types';
import { useHealthDeclarationsState } from '@/hooks/useHealthDeclarationsState';
import { HealthDeclarationsContextType } from './types';

const HealthDeclarationsContext = createContext<HealthDeclarationsContextType | null>(null);

export const useHealthDeclarationsContext = () => {
  const context = useContext(HealthDeclarationsContext);
  if (!context) {
    throw new Error('useHealthDeclarationsContext must be used within a HealthDeclarationsProvider');
  }
  return context;
};

export const HealthDeclarationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    healthDeclarations,
    loading,
    addHealthDeclaration,
    updateHealthDeclaration,
    getHealthDeclarationForRegistration,
    sendHealthDeclarationSMS
  } = useHealthDeclarationsState();
  
  const contextValue: HealthDeclarationsContextType = {
    healthDeclarations,
    addHealthDeclaration,
    updateHealthDeclaration,
    getHealthDeclarationForRegistration,
    sendHealthDeclarationSMS,
    loading
  };

  return (
    <HealthDeclarationsContext.Provider value={contextValue}>
      {children}
    </HealthDeclarationsContext.Provider>
  );
};
