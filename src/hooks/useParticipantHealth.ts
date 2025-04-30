
import { useState } from 'react';
import { Participant, Registration, HealthDeclaration } from '@/types';
import { toast } from "@/components/ui/use-toast";

export const useParticipantHealth = (
  getHealthDeclarationForRegistration: (registrationId: string) => HealthDeclaration | undefined,
  addHealthDeclaration: (declaration: Omit<HealthDeclaration, 'id'>) => Promise<HealthDeclaration | undefined>,
  updateParticipant: (participant: Participant) => void,
  participants: Participant[],
  registrations: Registration[]
) => {
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [currentHealthDeclaration, setCurrentHealthDeclaration] = useState<{
    registrationId: string;
    participantName: string;
    phone: string;
    declaration?: HealthDeclaration;
  } | null>(null);

  // Handler for opening health link dialog
  const handleOpenHealthForm = async (
    registrationId: string, 
    getParticipantForRegistration: (registration: Registration) => Participant | undefined
  ) => {
    const registration = registrations.find(reg => reg.id === registrationId);
    if (!registration) return;

    const participant = getParticipantForRegistration(registration);
    if (!participant) return;

    let healthDeclaration = getHealthDeclarationForRegistration(registrationId);

    // If no health declaration exists for this registration, create one
    if (!healthDeclaration) {
      const newDeclaration = await addHealthDeclaration({
        registrationId,
        phone: participant.phone,
        formStatus: 'pending',
        sentAt: new Date().toISOString()
      });
      
      if (newDeclaration) {
        healthDeclaration = newDeclaration;
      } else {
        toast({
          title: "שגיאה",
          description: "לא ניתן ליצור הצהרת בריאות",
          variant: "destructive",
        });
        return;
      }
    }

    setCurrentHealthDeclaration({
      registrationId,
      participantName: `${participant.firstName} ${participant.lastName}`,
      phone: participant.phone,
      declaration: healthDeclaration
    });

    setIsLinkDialogOpen(true);
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
    isLinkDialogOpen,
    setIsLinkDialogOpen,
    currentHealthDeclaration,
    setCurrentHealthDeclaration,
    handleOpenHealthForm,
    handleUpdateHealthApproval
  };
};
