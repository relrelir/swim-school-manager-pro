
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
    console.log('Opening health form for registration:', registrationId);
    
    const registration = registrations.find(reg => reg.id === registrationId);
    if (!registration) {
      console.error('Registration not found:', registrationId);
      toast({
        title: "שגיאה",
        description: "לא נמצא רישום תקף",
        variant: "destructive",
      });
      return;
    }

    const participant = participants.find(p => p.id === registration.participantId);
    if (!participant) {
      console.error('Participant not found for registration:', registrationId);
      toast({
        title: "שגיאה",
        description: "לא נמצא משתתף לרישום זה",
        variant: "destructive",
      });
      return;
    }

    // Try to fetch an existing health declaration for this registration
    let healthDeclaration = getHealthDeclarationForRegistration(registrationId);
    console.log('Found health declaration:', healthDeclaration, 'for registration:', registrationId);

    // Set current declaration data for the dialog
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
