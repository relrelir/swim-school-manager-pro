
import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from "@/components/ui/use-toast";
import { Participant, HealthDeclaration } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { handleSupabaseError, mapParticipantFromDB, mapParticipantToDB } from './utils';

interface ParticipantsContextType {
  participants: Participant[];
  addParticipant: (participant: Omit<Participant, 'id'>) => Promise<Participant | undefined> | void;
  updateParticipant: (participant: Participant) => void;
  deleteParticipant: (id: string) => void;
  loading: boolean;
  healthDeclarations: HealthDeclaration[];
  getHealthDeclarationsByParticipant: (participantId: string) => HealthDeclaration[];
  sendHealthDeclaration: (participantId: string, phone: string, name: string) => Promise<void>;
  updateHealthDeclarationStatus: (formId: string, isApproved: boolean, notes?: string) => Promise<void>;
}

const ParticipantsContext = createContext<ParticipantsContextType | null>(null);

export const useParticipantsContext = () => {
  const context = useContext(ParticipantsContext);
  if (!context) {
    throw new Error('useParticipantsContext must be used within a ParticipantsProvider');
  }
  return context;
};

export const ParticipantsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [healthDeclarations, setHealthDeclarations] = useState<HealthDeclaration[]>([]);
  const [loading, setLoading] = useState(true);

  // Load participants and health declarations from Supabase
  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const { data, error } = await supabase
          .from('participants')
          .select('*');

        if (error) {
          handleSupabaseError(error, 'fetching participants');
        }

        if (data) {
          // Transform data to match our Participant type with proper casing
          const transformedParticipants = data.map(participant => mapParticipantFromDB(participant));
          setParticipants(transformedParticipants);
        }
        
        // Fetch health declarations
        const { data: healthData, error: healthError } = await supabase
          .from('health_declarations')
          .select('*');
          
        if (healthError) {
          handleSupabaseError(healthError, 'fetching health declarations');
        }
        
        if (healthData) {
          // Transform health declaration data to match our type with proper status types
          const transformedHealthDeclarations: HealthDeclaration[] = healthData.map(decl => {
            // Ensure formStatus is one of the valid enum values
            let formStatus: 'pending' | 'approved' | 'declined' = 'pending';
            if (decl.form_status === 'approved') formStatus = 'approved';
            if (decl.form_status === 'declined') formStatus = 'declined';
            
            return {
              id: decl.id,
              participantId: decl.participant_id,
              formStatus,
              submissionDate: decl.submission_date,
              notes: decl.notes,
              phoneSentTo: decl.phone_sent_to,
              createdAt: decl.created_at,
              updatedAt: decl.updated_at
            };
          });
          setHealthDeclarations(transformedHealthDeclarations);
        }
      } catch (error) {
        console.error('Error loading participants:', error);
        toast({
          title: "שגיאה",
          description: "אירעה שגיאה בטעינת משתתפים",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchParticipants();
  }, []);

  // Helper to get health declarations for a specific participant
  const getHealthDeclarationsByParticipant = (participantId: string) => {
    return healthDeclarations.filter(decl => decl.participantId === participantId);
  };

  // Send a health declaration form to a participant
  const sendHealthDeclaration = async (participantId: string, phone: string, name: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('send-health-form', {
        body: { participantId, phone, name }
      });
      
      if (error) throw new Error(error.message);
      
      // Add the new health declaration to our local state
      if (data && data.formId) {
        const newHealthDeclaration: HealthDeclaration = {
          id: data.formId,
          participantId,
          formStatus: 'pending',
          phoneSentTo: phone,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        setHealthDeclarations([...healthDeclarations, newHealthDeclaration]);
      }
      
      toast({
        title: "נשלח בהצלחה",
        description: "טופס הצהרת בריאות נשלח למשתתף",
      });
    } catch (error: any) {
      console.error('Error sending health declaration:', error);
      toast({
        title: "שגיאה",
        description: error.message || "אירעה שגיאה בשליחת הצהרת בריאות",
        variant: "destructive",
      });
      throw error;
    }
  };
  
  // Update health declaration status
  const updateHealthDeclarationStatus = async (formId: string, isApproved: boolean, notes?: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('update-health-form', {
        body: { formId, agreed: isApproved, notes }
      });
      
      if (error) throw new Error(error.message);
      
      // Update health declaration in local state
      setHealthDeclarations(prevDeclarations => 
        prevDeclarations.map(decl => 
          decl.id === formId 
            ? {
                ...decl,
                formStatus: isApproved ? 'approved' : 'declined',
                submissionDate: new Date().toISOString(),
                notes: notes || decl.notes,
                updatedAt: new Date().toISOString()
              }
            : decl
        )
      );
      
      // If approved, also update the participant's health approval status
      if (isApproved) {
        const declaration = healthDeclarations.find(decl => decl.id === formId);
        if (declaration) {
          const participant = participants.find(p => p.id === declaration.participantId);
          if (participant) {
            await updateParticipantHealth({
              ...participant,
              healthApproval: true
            });
          }
        }
      }
      
      toast({
        title: "עודכן בהצלחה",
        description: "סטטוס הצהרת הבריאות עודכן",
      });
    } catch (error: any) {
      console.error('Error updating health declaration:', error);
      toast({
        title: "שגיאה",
        description: error.message || "אירעה שגיאה בעדכון הצהרת בריאות",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Add a participant
  const addParticipant = async (participant: Omit<Participant, 'id'>) => {
    try {
      // Convert to DB field names format (lowercase)
      const dbParticipant = mapParticipantToDB(participant);
      
      const { data, error } = await supabase
        .from('participants')
        .insert([dbParticipant])
        .select()
        .single();

      if (error) {
        handleSupabaseError(error, 'adding participant');
      }

      if (data) {
        // Convert back to our TypeScript model format (camelCase)
        const newParticipant = mapParticipantFromDB(data);
        setParticipants([...participants, newParticipant]);
        return newParticipant;
      }
    } catch (error) {
      console.error('Error adding participant:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בהוספת משתתף חדש",
        variant: "destructive",
      });
    }
  };

  // Update participant specific for health approval
  const updateParticipantHealth = async (participant: Participant) => {
    try {
      const { id, ...participantData } = participant;
      const dbParticipant = mapParticipantToDB(participantData);
      
      const { error } = await supabase
        .from('participants')
        .update(dbParticipant)
        .eq('id', id);

      if (error) {
        handleSupabaseError(error, 'updating participant');
      }

      setParticipants(participants.map(p => p.id === id ? participant : p));
    } catch (error) {
      console.error('Error updating participant:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בעדכון משתתף",
        variant: "destructive",
      });
    }
  };

  // Update a participant (general function)
  const updateParticipant = async (participant: Participant) => {
    try {
      const { id, ...participantData } = participant;
      const dbParticipant = mapParticipantToDB(participantData);
      
      const { error } = await supabase
        .from('participants')
        .update(dbParticipant)
        .eq('id', id);

      if (error) {
        handleSupabaseError(error, 'updating participant');
      }

      setParticipants(participants.map(p => p.id === id ? participant : p));
    } catch (error) {
      console.error('Error updating participant:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בעדכון משתתף",
        variant: "destructive",
      });
    }
  };

  const contextValue: ParticipantsContextType = {
    participants,
    addParticipant,
    updateParticipant,
    deleteParticipant: async (id: string) => {
      try {
        const { error } = await supabase
          .from('participants')
          .delete()
          .eq('id', id);

        if (error) {
          handleSupabaseError(error, 'deleting participant');
        }

        setParticipants(participants.filter(p => p.id !== id));
      } catch (error) {
        console.error('Error deleting participant:', error);
        toast({
          title: "שגיאה",
          description: "אירעה שגיאה במחיקת משתתף",
          variant: "destructive",
        });
      }
    },
    loading,
    healthDeclarations,
    getHealthDeclarationsByParticipant,
    sendHealthDeclaration,
    updateHealthDeclarationStatus
  };

  return (
    <ParticipantsContext.Provider value={contextValue}>
      {children}
    </ParticipantsContext.Provider>
  );
};
