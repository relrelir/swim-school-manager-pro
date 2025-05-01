
import React, { useState, useEffect } from 'react';
import { HealthDeclaration } from '@/types';
import { HealthDeclarationsContext, HealthDeclarationsContextType } from './healthDeclarations/context';
import { 
  fetchHealthDeclarations, 
  addHealthDeclarationService,
  updateHealthDeclarationService
} from './healthDeclarations/service';

export { useHealthDeclarationsContext } from './healthDeclarations/useHealthDeclarations';

export const HealthDeclarationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [healthDeclarations, setHealthDeclarations] = useState<HealthDeclaration[]>([]);
  const [loading, setLoading] = useState(true);

  // Load health declarations from Supabase
  useEffect(() => {
    const loadDeclarations = async () => {
      const declarations = await fetchHealthDeclarations();
      console.log("Loaded health declarations:", declarations);
      setHealthDeclarations(declarations);
      setLoading(false);
    };

    loadDeclarations();
  }, []);

  // Add a health declaration
  const addHealthDeclaration = async (healthDeclaration: Omit<HealthDeclaration, 'id'>) => {
    const newHealthDeclaration = await addHealthDeclarationService(healthDeclaration);
    if (newHealthDeclaration) {
      setHealthDeclarations([...healthDeclarations, newHealthDeclaration]);
    }
    return newHealthDeclaration;
  };

  // Update a health declaration
  const updateHealthDeclaration = async (id: string, updates: Partial<HealthDeclaration>) => {
    await updateHealthDeclarationService(id, updates);
    setHealthDeclarations(declarations => 
      declarations.map(declaration => 
        declaration.id === id ? { ...declaration, ...updates } : declaration
      )
    );
  };

  // Get health declaration for a specific registration
  const getHealthDeclarationForRegistration = (registrationId: string) => {
    console.log("Looking for health declaration for registration:", registrationId);
    console.log("Available declarations:", healthDeclarations.length);
    
    // First, try to find a health declaration that has participant_id equal to registrationId
    // This handles cases where the registration ID was saved as participant_id in the database
    let declaration = healthDeclarations.find(declaration => 
      declaration.participant_id === registrationId
    );
    
    // If not found by participant_id field, try the registrationId field (added for backward compatibility)
    if (!declaration) {
      declaration = healthDeclarations.find(declaration => 
        declaration.registrationId === registrationId
      );
    }
    
    // If still not found, log more details for debugging
    if (!declaration) {
      console.log("Declaration not found by direct match, available IDs:", 
        healthDeclarations.map(d => ({ 
          id: d.id, 
          participant_id: d.participant_id, 
          registrationId: d.registrationId,
          form_status: d.form_status
        }))
      );
    } else {
      console.log("Found declaration:", declaration);
    }
    
    return declaration;
  };

  const contextValue: HealthDeclarationsContextType = {
    healthDeclarations,
    addHealthDeclaration,
    updateHealthDeclaration,
    getHealthDeclarationForRegistration,
    loading
  };

  return (
    <HealthDeclarationsContext.Provider value={contextValue}>
      {children}
    </HealthDeclarationsContext.Provider>
  );
};
