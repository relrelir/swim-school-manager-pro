
import { useState, useEffect } from 'react';
import { HealthDeclaration } from '@/types';
import { toast } from "@/components/ui/use-toast";
import { 
  fetchHealthDeclarations, 
  addHealthDeclarationService,
  updateHealthDeclarationService
} from './service';
import { findHealthDeclarationByRegistrationId } from './utils/healthDeclarationLookup';

export function useHealthDeclarationsProvider() {
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
    return await findHealthDeclarationByRegistrationId(registrationId, healthDeclarations);
  };

  return {
    healthDeclarations,
    addHealthDeclaration,
    updateHealthDeclaration,
    getHealthDeclarationForRegistration,
    loading
  };
}
