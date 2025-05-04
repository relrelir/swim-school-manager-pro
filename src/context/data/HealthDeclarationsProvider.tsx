
import React, { useState, useEffect } from 'react';
import { HealthDeclaration } from '@/types';
import { HealthDeclarationsContext, HealthDeclarationsContextType } from './healthDeclarations/context';
import { 
  fetchHealthDeclarations, 
  addHealthDeclarationService,
  updateHealthDeclarationService
} from './healthDeclarations/service';
import { supabase } from '@/integrations/supabase/client';

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
  const getHealthDeclarationForRegistration = async (registrationId: string) => {
    if (!registrationId) {
      console.error("Registration ID is undefined or null");
      return undefined;
    }
    
    console.log("Looking for health declaration for registration:", registrationId);
    console.log("Available declarations:", healthDeclarations.length);
    
    // IMPROVED APPROACH: First try to get participant ID from registration table
    try {
      const { data: registrationData, error: registrationError } = await supabase
        .from('registrations')
        .select('participantid')
        .eq('id', registrationId)
        .maybeSingle();
        
      if (!registrationError && registrationData && registrationData.participantid) {
        const participantId = registrationData.participantid;
        console.log(`Found participant ID ${participantId} for registration ${registrationId}`);
        
        // Look for health declarations that match this participant ID
        const matchingDeclaration = healthDeclarations.find(
          d => d.participant_id === participantId
        );
        
        if (matchingDeclaration) {
          console.log(`Found health declaration ${matchingDeclaration.id} by participant ID match`);
          return matchingDeclaration;
        } else {
          console.log(`No health declaration found for participant ID ${participantId}`);
        }
      }
    } catch (error) {
      console.error("Error looking up participant ID from registration:", error);
    }
    
    // Try multiple fallback matching strategies
    
    // 1. Direct match with registrationId field
    let declaration = healthDeclarations.find(declaration => 
      declaration.registrationId === registrationId
    );
    
    if (declaration) {
      console.log("Found health declaration by registrationId direct match:", declaration.id);
      return declaration;
    }
    
    // 2. Try participant_id field - FIXED: removed the problematic condition
    declaration = healthDeclarations.find(declaration => 
      declaration.participant_id === registrationId
    );
    
    if (declaration) {
      console.log("Found health declaration by participant_id match:", declaration.id);
      return declaration;
    }
    
    // 3. Try to match using participantId part from the registrationId
    // Registration IDs often follow patterns like 'product-participantId' or similar
    const parts = registrationId.split(/[-_]/);
    if (parts.length > 1) {
      for (const part of parts) {
        if (part.length > 4) { // Only check substantial parts, not single chars
          declaration = healthDeclarations.find(d => {
            return (d.participant_id && d.participant_id.includes(part)) || 
                   (d.registrationId && d.registrationId.includes(part));
          });
          
          if (declaration) {
            console.log("Found health declaration by ID part match:", declaration.id, "for registration:", registrationId);
            return declaration;
          }
        }
      }
    }
    
    // 4. Look for any health declaration that might contain parts of the registration ID
    declaration = healthDeclarations.find(d => {
      if (!d.participant_id && !d.registrationId) return false;
      
      // Check if registration ID contains participant_id or vice versa
      if (d.participant_id && registrationId.includes(d.participant_id)) {
        return true;
      }
      
      if (d.participant_id && d.participant_id.includes(registrationId)) {
        return true;
      }
      
      // Check if registrationId in declaration matches our registration ID
      if (d.registrationId && (d.registrationId.includes(registrationId) || registrationId.includes(d.registrationId))) {
        return true;
      }
      
      return false;
    });
    
    if (declaration) {
      console.log("Found health declaration by partial ID match:", declaration.id);
      return declaration;
    }
    
    // 5. Try matching any numeric part if participant_id contains numbers
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
    
    // 6. Last resort: try comparing just UUIDs without prefixes/suffixes
    const uuidPattern = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
    const registrationUuidMatch = registrationId.match(uuidPattern);
    
    if (registrationUuidMatch) {
      const registrationUuid = registrationUuidMatch[0];
      
      declaration = healthDeclarations.find(d => {
        // Check participant_id
        if (d.participant_id) {
          const participantUuidMatch = d.participant_id.match(uuidPattern);
          if (participantUuidMatch && participantUuidMatch[0] === registrationUuid) {
            return true;
          }
        }
        
        // Check registrationId
        if (d.registrationId) {
          const declRegistrationUuidMatch = d.registrationId.match(uuidPattern);
          if (declRegistrationUuidMatch && declRegistrationUuidMatch[0] === registrationUuid) {
            return true;
          }
        }
        
        return false;
      });
      
      if (declaration) {
        console.log("Found health declaration by UUID match:", declaration.id);
        return declaration;
      }
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
