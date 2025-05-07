
import { useState, useEffect } from 'react';
import { HealthDeclaration } from '@/types';
import { toast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { fetchHealthDeclarations } from './fetchHealthDeclarations';
import { addHealthDeclaration as addHealthDeclarationService } from './addHealthDeclaration';
import { updateHealthDeclaration as updateHealthDeclarationService } from './updateHealthDeclaration';
import { getHealthDeclaration as getHealthDeclarationService } from './getHealthDeclaration';
import { createHealthDeclarationLink as createHealthDeclarationLinkService } from './createHealthDeclarationLink';
import { HealthDeclarationsContextType } from './context';

export const useHealthDeclarationsProvider = (): HealthDeclarationsContextType => {
  const [healthDeclarations, setHealthDeclarations] = useState<HealthDeclaration[]>([]);
  const [loading, setLoading] = useState(true);

  // Load health declarations from Supabase
  useEffect(() => {
    const loadHealthDeclarations = async () => {
      try {
        const declarations = await fetchHealthDeclarations();
        setHealthDeclarations(declarations);
      } catch (error) {
        console.error('Error loading health declarations:', error);
        toast({
          title: "שגיאה",
          description: "אירעה שגיאה בטעינת הצהרות בריאות",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadHealthDeclarations();
  }, []);

  // Add a health declaration
  const addHealthDeclaration = async (declaration: Omit<HealthDeclaration, 'id'>) => {
    try {
      const newDeclaration = await addHealthDeclarationService(declaration);
      if (newDeclaration) {
        setHealthDeclarations([...healthDeclarations, newDeclaration]);
        return newDeclaration;
      }
    } catch (error) {
      console.error('Error adding health declaration:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בהוספת הצהרת בריאות",
        variant: "destructive",
      });
    }
  };

  // Update a health declaration
  const updateHealthDeclaration = async (id: string, declaration: Partial<HealthDeclaration>) => {
    try {
      const updatedDeclaration = await updateHealthDeclarationService(id, declaration);
      if (updatedDeclaration) {
        setHealthDeclarations(
          healthDeclarations.map((h) => (h.id === id ? updatedDeclaration : h))
        );
        return updatedDeclaration;
      }
    } catch (error) {
      console.error('Error updating health declaration:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בעדכון הצהרת בריאות",
        variant: "destructive",
      });
    }
  };

  // Delete a health declaration
  const deleteHealthDeclaration = async (id: string) => {
    try {
      const { error } = await supabase
        .from('health_declarations')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      setHealthDeclarations(healthDeclarations.filter((h) => h.id !== id));
    } catch (error) {
      console.error('Error deleting health declaration:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה במחיקת הצהרת בריאות",
        variant: "destructive",
      });
    }
  };

  // Get a health declaration for a registration
  const getHealthDeclarationForRegistration = async (registrationId: string) => {
    try {
      return await getHealthDeclarationService(registrationId);
    } catch (error) {
      console.error('Error getting health declaration:', error);
    }
  };

  // Create a health declaration link
  const createHealthDeclarationLink = async (registrationId: string) => {
    try {
      return await createHealthDeclarationLinkService(registrationId);
    } catch (error) {
      console.error('Error creating health declaration link:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה ביצירת קישור להצהרת בריאות",
        variant: "destructive",
      });
    }
  };

  // Get a health declaration by token
  const getHealthDeclarationByToken = async (token: string) => {
    try {
      const { data, error } = await supabase
        .from('health_declarations')
        .select('*')
        .eq('token', token)
        .single();

      if (error) throw error;
      
      return data as HealthDeclaration;
    } catch (error) {
      console.error('Error getting health declaration by token:', error);
      return undefined;
    }
  };

  return {
    healthDeclarations,
    addHealthDeclaration,
    updateHealthDeclaration,
    deleteHealthDeclaration,
    getHealthDeclarationForRegistration,
    createHealthDeclarationLink,
    getHealthDeclarationByToken,
    loading
  };
};
