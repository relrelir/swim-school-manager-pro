
import { useState } from 'react';
import { Participant, Registration, HealthDeclaration } from '@/types';
import { toast } from "@/components/ui/use-toast";

export const useParticipantHealth = (
  getHealthDeclarationForRegistration: (registrationId: string) => HealthDeclaration | undefined,
  sendHealthDeclarationSMS: (healthDeclarationId: string, phone: string) => Promise<void>,
  addHealthDeclaration: (declaration: Omit<HealthDeclaration, 'id'>) => void,
  updateHealthDeclaration: (declaration: HealthDeclaration) => void,
  updateParticipant: (participant: Participant) => void,
  participants: Participant[],
  registrations: Registration[] // Add registrations parameter
) => {
  const [isHealthFormOpen, setIsHealthFormOpen] = useState(false);
  const [currentHealthDeclaration, setCurrentHealthDeclaration] = useState<{
    registrationId: string;
    participantName: string;
    phone: string;
    declaration?: HealthDeclaration;
  } | null>(null);

  // Handler for opening health form
  const handleOpenHealthForm = (
    registrationId: string, 
    getParticipantForRegistration: (registration: Registration) => Participant | undefined, 
    registrations: Registration[]
  ) => {
    const registration = registrations.find(reg => reg.id === registrationId);
    if (!registration) return;

    const participant = getParticipantForRegistration(registration);
    if (!participant) return;

    const healthDeclaration = getHealthDeclarationForRegistration(registrationId);

    setCurrentHealthDeclaration({
      registrationId,
      participantName: `${participant.firstName} ${participant.lastName}`,
      phone: participant.phone,
      declaration: healthDeclaration
    });

    setIsHealthFormOpen(true);
  };

  // Handle updating health approval
  const handleUpdateHealthApproval = (registrationId: string, isApproved: boolean) => {
    // Find the corresponding registration and participant
    const registration = registrations.find(reg => reg.participantId && reg.id === registrationId);
    if (registration) {
      const participant = participants.find(p => p.id === registration.participantId);
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
    }
  };

  return {
    isHealthFormOpen,
    setIsHealthFormOpen,
    currentHealthDeclaration,
    setCurrentHealthDeclaration,
    handleOpenHealthForm,
    handleUpdateHealthApproval
  };
};
