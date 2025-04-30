
import { useState } from 'react';
import { HealthDeclaration, Participant } from '@/types';
import { toast } from "@/components/ui/use-toast";

export const useHealthDeclarationDialog = (
  getHealthDeclarationForRegistration: (registrationId: string) => HealthDeclaration | undefined,
  addHealthDeclaration: (declaration: Omit<HealthDeclaration, 'id'>) => Promise<HealthDeclaration | undefined>
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
    participants: Participant[], 
    registrations: any[]
  ) => {
    const registration = registrations.find(reg => reg.id === registrationId);
    if (!registration) return;

    const participant = participants.find(p => p.id === registration.participantId);
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

  return {
    isLinkDialogOpen,
    setIsLinkDialogOpen,
    currentHealthDeclaration,
    setCurrentHealthDeclaration,
    handleOpenHealthForm
  };
};
