
import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from "@/components/ui/use-toast";
import { Participant } from '@/types';
import { ParticipantsContextType } from './types';
import { generateId, loadData, saveData } from './utils';

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
  const [participants, setParticipants] = useState<Participant[]>(() => loadData('swimSchoolParticipants', []));

  // Save data to localStorage whenever it changes
  useEffect(() => {
    saveData('swimSchoolParticipants', participants);
  }, [participants]);

  // Participants functions
  const addParticipant = (participant: Omit<Participant, 'id'>) => {
    const newParticipant = { ...participant, id: generateId() };
    setParticipants([...participants, newParticipant]);
  };

  const updateParticipant = (participant: Participant) => {
    setParticipants(participants.map(p => p.id === participant.id ? participant : p));
  };

  const deleteParticipant = (id: string) => {
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
    setParticipants(participants.filter(p => p.id !== id));
  };

  const contextValue: ParticipantsContextType = {
    participants,
    addParticipant,
    updateParticipant,
    deleteParticipant,
  };

  return (
    <ParticipantsContext.Provider value={contextValue}>
      {children}
    </ParticipantsContext.Provider>
  );
};
