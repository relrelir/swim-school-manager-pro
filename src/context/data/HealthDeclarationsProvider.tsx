
import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from "@/components/ui/use-toast";
import { HealthDeclaration, HealthDeclarationStatus } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { handleSupabaseError, mapHealthDeclarationFromDB, mapHealthDeclarationToDB } from './utils';

interface HealthDeclarationsContextType {
  healthDeclarations: HealthDeclaration[];
  addHealthDeclaration: (healthDeclaration: Omit<HealthDeclaration, 'id'>) => Promise<HealthDeclaration | undefined>;
  updateHealthDeclaration: (id: string, updates: Partial<HealthDeclaration>) => Promise<void>;
  getHealthDeclarationForRegistration: (registrationId: string) => HealthDeclaration | undefined;
  sendHealthDeclarationSMS: (healthDeclarationId: string, phone: string) => Promise<void>;
  loading: boolean;
}

const HealthDeclarationsContext = createContext<HealthDeclarationsContextType | null>(null);

export const useHealthDeclarationsContext = () => {
  const context = useContext(HealthDeclarationsContext);
  if (!context) {
    throw new Error('useHealthDeclarationsContext must be used within a HealthDeclarationsProvider');
  }
  return context;
};

export const HealthDeclarationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [healthDeclarations, setHealthDeclarations] = useState<HealthDeclaration[]>([]);
  const [loading, setLoading] = useState(true);

  // Load health declarations from Supabase
  useEffect(() => {
    const fetchHealthDeclarations = async () => {
      try {
        const { data, error } = await supabase
          .from('health_declarations')
          .select('*');

        if (error) {
          handleSupabaseError(error, 'fetching health declarations');
        }

        if (data) {
          // Transform data to match our HealthDeclaration type using the updated mapHealthDeclarationFromDB
          const transformedDeclarations = data.map(declaration => mapHealthDeclarationFromDB(declaration));
          setHealthDeclarations(transformedDeclarations);
        }
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

    fetchHealthDeclarations();
  }, []);

  // Add a health declaration
  const addHealthDeclaration = async (healthDeclaration: Omit<HealthDeclaration, 'id'>): Promise<HealthDeclaration | undefined> => {
    try {
      // Convert to DB field names format using the updated mapHealthDeclarationToDB
      const dbHealthDeclaration = mapHealthDeclarationToDB(healthDeclaration);
      
      // Make sure participant_id is properly set
      if (!dbHealthDeclaration.participant_id) {
        console.error('Missing participant_id in health declaration');
        return undefined;
      }

      // Make sure we have a token generated for the form
      if (!dbHealthDeclaration.token) {
        dbHealthDeclaration.token = crypto.randomUUID();
      }
      
      const { data, error } = await supabase
        .from('health_declarations')
        .insert([dbHealthDeclaration])
        .select()
        .single();

      if (error) {
        handleSupabaseError(error, 'adding health declaration');
        return undefined;
      }

      if (data) {
        // Convert back to our TypeScript model format
        const newHealthDeclaration = mapHealthDeclarationFromDB(data);
        setHealthDeclarations([...healthDeclarations, newHealthDeclaration]);
        return newHealthDeclaration;
      }
      return undefined;
    } catch (error) {
      console.error('Error adding health declaration:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בהוספת הצהרת בריאות חדשה",
        variant: "destructive",
      });
      return undefined;
    }
  };

  // Update a health declaration
  const updateHealthDeclaration = async (id: string, updates: Partial<HealthDeclaration>) => {
    try {
      const dbUpdates = mapHealthDeclarationToDB(updates);
      
      const { error } = await supabase
        .from('health_declarations')
        .update(dbUpdates)
        .eq('id', id);

      if (error) {
        handleSupabaseError(error, 'updating health declaration');
      }

      setHealthDeclarations(declarations => 
        declarations.map(declaration => 
          declaration.id === id ? { ...declaration, ...updates } : declaration
        )
      );
    } catch (error) {
      console.error('Error updating health declaration:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בעדכון הצהרת בריאות",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Get health declaration for a specific registration
  const getHealthDeclarationForRegistration = (registrationId: string) => {
    return healthDeclarations.find(declaration => declaration.registrationId === registrationId);
  };

  // Generate and copy health declaration link
  const sendHealthDeclarationSMS = async (healthDeclarationId: string, phone: string) => {
    try {
      // Call the Supabase edge function to generate link
      const { error, data } = await supabase.functions.invoke('send-health-sms', {
        body: {
          declarationId: healthDeclarationId,
          phone: phone
        },
      });
      
      if (error) {
        throw new Error(`Error generating health form link: ${error.message}`);
      }

      // Update local state
      setHealthDeclarations(declarations => 
        declarations.map(declaration => 
          declaration.id === healthDeclarationId 
            ? { 
                ...declaration, 
                phone: phone, 
                formStatus: 'sent', 
                sentAt: new Date().toISOString()
              } 
            : declaration
        )
      );

      // Display toast with form link
      if (data && data.formLink) {
        // Create a temporary input element to allow copying the link
        navigator.clipboard.writeText(data.formLink).catch((clipboardError) => {
          console.error("Failed to copy to clipboard:", clipboardError);
        });
        
        toast({
          title: "לינק נוצר בהצלחה",
          description: "לינק להצהרת בריאות נוצר והועתק בהצלחה",
        });
      } else {
        toast({
          title: "לינק נוצר",
          description: "לינק להצהרת בריאות נוצר בהצלחה",
        });
      }
      
      console.log('Health declaration link generated successfully:', data);
    } catch (error) {
      console.error('Error generating health declaration link:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה ביצירת לינק להצהרת בריאות",
        variant: "destructive",
      });
      throw error;
    }
  };

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
