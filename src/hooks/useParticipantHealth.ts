
import { useState } from 'react';
import { Participant } from '@/types';
import { toast } from "@/components/ui/use-toast";

export const useParticipantHealth = (
  updateParticipant: (participant: Participant) => void,
  participants: Participant[]
) => {
  // Handle updating health approval
  const handleUpdateHealthApproval = (registrationId: string, isApproved: boolean) => {
    // Find the corresponding registration and participant
    const participant = participants.find(p => p.id === registrationId);
    if (participant) {
      const updatedParticipant: Participant = {
        ...participant,
        healthApproval: isApproved
      };
      
      updateParticipant(updatedParticipant);
      
      toast({
        title: "אישור בריאות עודכן",
        description: `אישור בריאות ${isApproved ? 'התקבל' : 'בוטל'} עבור ${participant.firstName} ${participant.lastName}`,
      });
    }
  };

  return {
    handleUpdateHealthApproval
  };
};
