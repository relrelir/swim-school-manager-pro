
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
    
    let declaration;
    
    // First, try to find a health declaration that has registrationId field
    declaration = healthDeclarations.find(declaration => 
      declaration.registrationId === registrationId
    );
    
    // If not found by registrationId field, try participant_id field 
    if (!declaration) {
      declaration = healthDeclarations.find(declaration => 
        declaration.participant_id === registrationId
      );
    }
    
    // If still not found, try to match by participantId from the registrations
    if (!declaration && registrationId) {
      // This requires the registration object, which we don't have directly here
      // We need to rely on the participantId being passed in from outside this provider
      // Or fetch the registration from Supabase, but we'd need to inject that dependency
      const parts = registrationId.split('_');
      if (parts.length > 1) {
        const possibleParticipantId = parts[parts.length - 1];
        declaration = healthDeclarations.find(d => 
          d.participant_id === possibleParticipantId || d.registrationId === possibleParticipantId
        );
      }
    }
    
    // If still not found, log more details for debugging
    if (!declaration) {
      console.log("Declaration not found for registration ID:", registrationId);
      console.log("Available declaration IDs:", 
        healthDeclarations.map(d => ({ 
          id: d.id, 
          participant_id: d.participant_id, 
          registrationId: d.registrationId,
          form_status: d.form_status || d.formStatus
        }))
      );
    } else {
      console.log("Found declaration:", declaration);
    }
    
    // IMPORTANT: If you have a participant ID, try to find declarations for that participant
    // This is a fallback to find by participant ID
    if (!declaration) {
      console.log("Checking all available health declarations for a possible match:");
      healthDeclarations.forEach(decl => {
        console.log(`Declaration: ${decl.id}, participant_id: ${decl.participant_id}, registrationId: ${decl.registrationId}, status: ${decl.form_status || decl.formStatus}`);
      });
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
