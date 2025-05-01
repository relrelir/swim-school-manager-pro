
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
    
    if (!registrationId) {
      console.error("Registration ID is undefined or null");
      return undefined;
    }
    
    // Try multiple matching strategies
    
    // 1. Direct match with registrationId field
    let declaration = healthDeclarations.find(declaration => 
      declaration.registrationId === registrationId
    );
    
    if (declaration) {
      console.log("Found by registrationId direct match:", declaration);
      return declaration;
    }
    
    // 2. Try participant_id field (legacy field)
    declaration = healthDeclarations.find(declaration => 
      declaration.participant_id === registrationId
    );
    
    if (declaration) {
      console.log("Found by participant_id match:", declaration);
      return declaration;
    }
    
    // 3. If registrationId has underscore, try to extract participant ID
    if (registrationId.includes('_')) {
      const parts = registrationId.split('_');
      const possibleParticipantId = parts[parts.length - 1];
      
      declaration = healthDeclarations.find(d => 
        d.participant_id === possibleParticipantId || d.registrationId === possibleParticipantId
      );
      
      if (declaration) {
        console.log("Found by extracted participant ID:", declaration);
        return declaration;
      }
    }
    
    // 4. Last attempt - look for any health declaration with this registration's participant ID
    // This requires getting the participantId part from the registration ID format
    const lastDashIndex = registrationId.lastIndexOf('-');
    if (lastDashIndex !== -1) {
      const possibleParticipantIdPart = registrationId.substring(lastDashIndex + 1);
      
      declaration = healthDeclarations.find(d => {
        const participantIdMatch = d.participant_id?.includes(possibleParticipantIdPart);
        const registrationIdMatch = d.registrationId?.includes(possibleParticipantIdPart);
        return participantIdMatch || registrationIdMatch;
      });
      
      if (declaration) {
        console.log("Found by partial ID match:", declaration);
        return declaration;
      }
    }
    
    // If still not found, log detailed info for debugging
    console.log("Declaration not found for registration ID:", registrationId);
    console.log("Available declaration details:", 
      healthDeclarations.map(d => ({ 
        id: d.id, 
        participant_id: d.participant_id, 
        registrationId: d.registrationId,
        form_status: d.form_status || d.formStatus
      }))
    );
    
    return undefined;
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
