
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
    
    // 1. Try direct match with registrationId field
    let declaration = healthDeclarations.find(declaration => 
      declaration.registrationId === registrationId
    );
    
    // 2. If not found, try participant_id field 
    if (!declaration) {
      declaration = healthDeclarations.find(declaration => 
        declaration.participant_id === registrationId
      );
      
      if (declaration) {
        console.log("Found by participant_id match:", declaration);
      }
    } else {
      console.log("Found by registrationId match:", declaration);
    }
    
    // 3. If still not found and registrationId has underscore, try to extract participant ID
    if (!declaration && registrationId && registrationId.includes('_')) {
      const parts = registrationId.split('_');
      const possibleParticipantId = parts[parts.length - 1];
      
      declaration = healthDeclarations.find(d => 
        d.participant_id === possibleParticipantId || d.registrationId === possibleParticipantId
      );
      
      if (declaration) {
        console.log("Found by extracted participant ID:", declaration);
      }
    }
    
    // 4. Last attempt - try to match by looking for registration ID pattern (uuid format)
    // in all health declarations with any field
    if (!declaration) {
      // Create a regex pattern for UUID format
      const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      
      // Extract participant ID from registration if it's in format "regID_participantID"
      let participantId = registrationId;
      if (registrationId.includes('_')) {
        participantId = registrationId.split('_').pop() || '';
      }
      
      // If participantId looks like a UUID, try to find a match
      if (uuidPattern.test(participantId)) {
        declaration = healthDeclarations.find(d => {
          // Check multiple fields for the participant ID
          return d.participant_id === participantId || 
                 d.registrationId === participantId ||
                 (d.participantId && d.participantId === participantId);
        });
        
        if (declaration) {
          console.log("Found by UUID pattern match:", declaration);
        }
      }
    }
    
    // If still not found, log detailed info for debugging
    if (!declaration) {
      console.log("Declaration not found for registration ID:", registrationId);
      console.log("Available declaration details:", 
        healthDeclarations.map(d => ({ 
          id: d.id, 
          participant_id: d.participant_id, 
          registrationId: d.registrationId,
          participantId: d.participantId,
          form_status: d.form_status || d.formStatus
        }))
      );
    } else {
      console.log("Successfully found declaration:", declaration);
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
