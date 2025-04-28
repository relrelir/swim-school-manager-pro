
import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from "@/components/ui/use-toast";
import { Participant } from '@/types';
import { ParticipantsContextType } from './types';
import { generateId, handleSupabaseError } from './utils';
import { supabase } from '@/integrations/supabase/client';

const ParticipantsContext = createContext<ParticipantsContextType | null>(null);

export const useParticipantsContext = () => {
  const context = useContext(ParticipantsContext);
  if (!context) {
    throw new Error('useParticipantsContext must be used within a ParticipantsProvider');
  }
  return context;
};

export const ParticipantsProvider: React.FC<{ children: React.ReactNode; registrations?: any[] }> = ({ 
  children, 
  registrations = [] 
}) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);

  // Load participants from Supabase
  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const { data, error } = await supabase
          .from('participants')
          .select('*');

        if (error) {
          handleSupabaseError(error, 'fetching participants');
        }

        // Transform data to match our Participant type
        const transformedParticipants: Participant[] = data?.map(participant => ({
          id: participant.id,
          firstName: participant.firstName,
          lastName: participant.lastName,
          idNumber: participant.idNumber,
          phone: participant.phone,
          healthApproval: participant.healthApproval,
        })) || [];

        setParticipants(transformedParticipants);
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

  // Participants functions
  const addParticipant = async (participant: Omit<Participant, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('participants')
        .insert([participant])
        .select()
        .single();

      if (error) {
        handleSupabaseError(error, 'adding participant');
      }

      if (data) {
        const newParticipant: Participant = {
          id: data.id,
          firstName: data.firstName,
          lastName: data.lastName,
          idNumber: data.idNumber,
          phone: data.phone,
          healthApproval: data.healthApproval,
        };
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

  const updateParticipant = async (participant: Participant) => {
    try {
      const { error } = await supabase
        .from('participants')
        .update({
          firstName: participant.firstName,
          lastName: participant.lastName,
          idNumber: participant.idNumber,
          phone: participant.phone,
          healthApproval: participant.healthApproval,
        })
        .eq('id', participant.id);

      if (error) {
        handleSupabaseError(error, 'updating participant');
      }

      setParticipants(participants.map(p => p.id === participant.id ? participant : p));
    } catch (error) {
      console.error('Error updating participant:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בעדכון משתתף",
        variant: "destructive",
      });
    }
  };

  const deleteParticipant = async (id: string) => {
    try {
      // Check if participant has registrations
      const hasRegistrations = registrations.some(registration => registration.participantId === id);
      if (hasRegistrations) {
        toast({
          title: "שגיאה",
          description: "לא ניתן למחוק משתתף שיש לו רישומים",
          variant: "destructive",
        });
        return;
      }

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
  };

  const contextValue: ParticipantsContextType = {
    participants,
    addParticipant,
    updateParticipant,
    deleteParticipant,
    loading
  };

  return (
    <ParticipantsContext.Provider value={contextValue}>
      {children}
    </ParticipantsContext.Provider>
  );
};
