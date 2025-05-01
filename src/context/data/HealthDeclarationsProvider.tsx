
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
      try {
        const declarations = await fetchHealthDeclarations();
        console.log("Loaded health declarations:", declarations.length, 
          declarations.map(d => ({ id: d.id, participant_id: d.participant_id, registrationId: d.registrationId })));
        setHealthDeclarations(declarations);
      } catch (error) {
        console.error("Error loading health declarations:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDeclarations();
  }, []);

  // Add a health declaration
  const addHealthDeclaration = async (healthDeclaration: Omit<HealthDeclaration, 'id'>) => {
    try {
      const newHealthDeclaration = await addHealthDeclarationService(healthDeclaration);
      if (newHealthDeclaration) {
        setHealthDeclarations(prev => [...prev, newHealthDeclaration]);
        console.log("Added new health declaration:", newHealthDeclaration);
      }
      return newHealthDeclaration;
    } catch (error) {
      console.error("Error adding health declaration:", error);
      throw error;
    }
  };

  // Update a health declaration
  const updateHealthDeclaration = async (id: string, updates: Partial<HealthDeclaration>) => {
    try {
      await updateHealthDeclarationService(id, updates);
      setHealthDeclarations(declarations => 
        declarations.map(declaration => 
          declaration.id === id ? { ...declaration, ...updates } : declaration
        )
      );
      console.log("Updated health declaration:", id, updates);
    } catch (error) {
      console.error("Error updating health declaration:", error);
      throw error;
    }
  };

  // Get health declaration for a specific registration
  const getHealthDeclarationForRegistration = (registrationId: string) => {
    if (!registrationId) {
      console.error("Registration ID is undefined or null");
      return undefined;
    }
    
    console.log("Looking for health declaration for registration:", registrationId);
    console.log("Available declarations:", healthDeclarations.length);
    
    // Try multiple matching strategies
    
    // 1. Direct match with registrationId field
    let declaration = healthDeclarations.find(declaration => 
      declaration.registrationId === registrationId
    );
    
    if (declaration) {
      console.log("Found health declaration by registrationId direct match:", declaration.id);
      return declaration;
    }
    
    // 2. Try participant_id field (participant ID might be stored here)
    declaration = healthDeclarations.find(declaration => 
      declaration.participant_id === registrationId
    );
    
    if (declaration) {
      console.log("Found health declaration by participant_id match:", declaration.id);
      return declaration;
    }
    
    // 3. Try to extract participant ID from registration ID and match with participant_id field
    // Registration IDs often follow a pattern like 'something-participantId'
    const parts = registrationId.split('-');
    if (parts.length > 1) {
      const participantIdPart = parts[parts.length - 1];
      
      declaration = healthDeclarations.find(d => {
        // Check if participantId appears anywhere in the declaration's participant_id
        return d.participant_id?.includes(participantIdPart) || d.registrationId?.includes(participantIdPart);
      });
      
      if (declaration) {
        console.log("Found health declaration by participant ID part match:", declaration.id, "for registration:", registrationId);
        return declaration;
      }
    }
    
    // 4. If registrationId contains underscores, try extracting participant ID
    if (registrationId.includes('_')) {
      const parts = registrationId.split('_');
      const possibleParticipantId = parts[parts.length - 1];
      
      declaration = healthDeclarations.find(d => 
        d.participant_id?.includes(possibleParticipantId) || d.registrationId?.includes(possibleParticipantId)
      );
      
      if (declaration) {
        console.log("Found health declaration by underscore-separated ID:", declaration.id);
        return declaration;
      }
    }
    
    // 5. Look for any health declaration that might contain parts of the registration ID
    declaration = healthDeclarations.find(d => {
      if (!d.participant_id && !d.registrationId) return false;
      
      for (const part of parts) {
        if (part.length > 5) { // Only check substantial parts, not single chars
          if (d.participant_id?.includes(part) || d.registrationId?.includes(part)) {
            return true;
          }
        }
      }
      return false;
    });
    
    if (declaration) {
      console.log("Found health declaration by partial ID match:", declaration.id);
      return declaration;
    }
    
    // 6. Try matching any numeric part if participant_id contains numbers
    const numericMatch = registrationId.match(/\d+/);
    if (numericMatch) {
      const numericPart = numericMatch[0];
      if (numericPart.length > 3) { // Only check numeric patterns of reasonable length
        declaration = healthDeclarations.find(d => {
          const participantIdNumericMatch = d.participant_id?.match(/\d+/);
          const registrationIdNumericMatch = d.registrationId?.match(/\d+/);
          return (participantIdNumericMatch && participantIdNumericMatch[0] === numericPart) || 
                 (registrationIdNumericMatch && registrationIdNumericMatch[0] === numericPart);
        });
      }
      
      if (declaration) {
        console.log("Found health declaration by numeric part match:", declaration.id);
        return declaration;
      }
    }
    
    // 7. Try to find a declaration where participant_id matches any part of registrationId or vice versa
    const registrationSegments = registrationId.split(/[-_]/); // Split by common separators
    
    declaration = healthDeclarations.find(d => {
      if (!d.participant_id && !d.registrationId) return false;
      
      // Check if any segment of registrationId appears in participant_id
      for (const segment of registrationSegments) {
        if (segment.length > 4 && d.participant_id?.includes(segment)) {
          return true;
        }
      }
      
      // Check if any part of participant_id appears in registrationId
      if (d.participant_id) {
        const participantSegments = d.participant_id.split(/[-_]/);
        for (const segment of participantSegments) {
          if (segment.length > 4 && registrationId.includes(segment)) {
            return true;
          }
        }
      }
      
      return false;
    });
    
    if (declaration) {
      console.log("Found health declaration by segment matching:", declaration.id);
      return declaration;
    }
    
    // Log all available declarations for debugging
    console.log("Declaration not found for registration ID:", registrationId);
    console.log("Available declaration IDs:", 
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
