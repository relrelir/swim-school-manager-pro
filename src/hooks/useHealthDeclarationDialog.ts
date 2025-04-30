
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
    console.log('Found health declaration:', getHealthDeclarationForRegistration(registrationId), 'for registration:', registrationId);
    
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

    let healthDeclaration = getHealthDeclarationForRegistration(registrationId);

    // If no health declaration exists for this registration, create one
    if (!healthDeclaration) {
      console.log('Creating new health declaration for registration:', registrationId);
      try {
        // Create health declaration with all required fields properly mapped
        const newDeclaration = await addHealthDeclaration({
          // Essential DB fields with correct naming
          participant_id: registrationId,
          phone_sent_to: participant.phone,
          form_status: 'pending',
          created_at: new Date().toISOString(),
          
          // Convenience fields used in our frontend code
          registrationId: registrationId,
          phone: participant.phone,
          formStatus: 'pending',
          sentAt: new Date().toISOString()
        });
        
        console.log('Health declaration creation response:', newDeclaration);
        
        if (newDeclaration) {
          console.log('Successfully created new health declaration:', newDeclaration);
          healthDeclaration = newDeclaration;
        } else {
          console.error('Failed to create health declaration - undefined response');
          throw new Error('Failed to create health declaration - undefined response');
        }
      } catch (error) {
        console.error('Error creating health declaration:', error);
        toast({
          title: "שגיאה",
          description: "לא ניתן ליצור הצהרת בריאות",
          variant: "destructive",
        });
        return;
      }
    }

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
