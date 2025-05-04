
import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from "@/components/ui/use-toast";
import { HealthDeclaration, HealthDeclarationStatus } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { handleSupabaseError } from './utils';

interface HealthDeclarationsContextType {
  healthDeclarations: HealthDeclaration[];
  addHealthDeclaration: (healthDeclaration: Omit<HealthDeclaration, 'id'>) => Promise<HealthDeclaration | undefined> | void;
  updateHealthDeclaration: (id: string, updates: Partial<HealthDeclaration>) => Promise<void>;
  getHealthDeclarationForRegistration: (registrationId: string) => HealthDeclaration | undefined;
  sendHealthDeclarationSMS: (healthDeclarationId: string, phone: string) => Promise<void>;
  loading: boolean;
}

// Helper to map from DB column names to our TypeScript model
const mapHealthDeclarationFromDB = (dbDeclaration: any): HealthDeclaration => {
  return {
    id: dbDeclaration.id,
    registrationId: dbDeclaration.registration_id,
    phone: dbDeclaration.phone || '',
    formStatus: dbDeclaration.form_status as HealthDeclarationStatus,
    sentAt: dbDeclaration.sent_at || '',
    signedAt: dbDeclaration.signed_at,
    clientAnswer: dbDeclaration.client_answer,
    notes: dbDeclaration.notes
  };
};

// Helper to map from our TypeScript model to DB column names
const mapHealthDeclarationToDB = (declaration: Partial<HealthDeclaration>): any => {
  const result: any = {};
  
  if (declaration.registrationId !== undefined) result.registration_id = declaration.registrationId;
  if (declaration.phone !== undefined) result.phone = declaration.phone;
  if (declaration.formStatus !== undefined) result.form_status = declaration.formStatus;
  if (declaration.sentAt !== undefined) result.sent_at = declaration.sentAt;
  if (declaration.signedAt !== undefined) result.signed_at = declaration.signedAt;
  if (declaration.clientAnswer !== undefined) result.client_answer = declaration.clientAnswer;
  if (declaration.notes !== undefined) result.notes = declaration.notes;
  
  return result;
};

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
          // Transform data to match our HealthDeclaration type
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
  const addHealthDeclaration = async (healthDeclaration: Omit<HealthDeclaration, 'id'>) => {
    try {
      // Convert to DB field names format
      const dbHealthDeclaration = mapHealthDeclarationToDB(healthDeclaration);
      
      const { data, error } = await supabase
        .from('health_declarations')
        .insert([dbHealthDeclaration])
        .select()
        .single();

      if (error) {
        handleSupabaseError(error, 'adding health declaration');
      }

      if (data) {
        // Convert back to our TypeScript model format
        const newHealthDeclaration = mapHealthDeclarationFromDB(data);
        setHealthDeclarations([...healthDeclarations, newHealthDeclaration]);
        return newHealthDeclaration;
      }
    } catch (error) {
      console.error('Error adding health declaration:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בהוספת הצהרת בריאות חדשה",
        variant: "destructive",
      });
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

  // Send SMS for health declaration
  const sendHealthDeclarationSMS = async (healthDeclarationId: string, phone: string) => {
    try {
      // Call the Supabase edge function to send SMS
      const { error, data } = await supabase.functions.invoke('send-health-sms', {
        body: {
          declarationId: healthDeclarationId,
          phone: phone
        },
      });
      
      if (error) {
        throw new Error(`Error sending SMS: ${error.message}`);
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

      toast({
        title: "SMS נשלח",
        description: `קישור להצהרת בריאות נשלח למספר ${phone}`,
      });
      
      console.log('SMS sent successfully:', data);
    } catch (error) {
      console.error('Error sending SMS:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בשליחת SMS",
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
