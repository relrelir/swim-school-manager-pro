
import { useState } from 'react';
import { toast } from "@/components/ui/use-toast";
import { Participant, Registration } from '@/types';

export const useParticipantHealth = (
  getHealthDeclarationForRegistration: any,
  addHealthDeclaration: any,
  updateParticipant: any,
  participants: Participant[],
  registrations: Registration[]
) => {
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [currentHealthDeclaration, setCurrentHealthDeclaration] = useState<any>(null);

  // Handler for health approval toggle
  const handleUpdateHealthApproval = async (registrationId: string, isApproved: boolean) => {
    try {
      // Find registration and participant
      const registration = registrations.find(r => r.id === registrationId);
      if (!registration) {
        toast({
          title: "שגיאה",
          description: "לא נמצא רישום מתאים",
          variant: "destructive",
        });
        return;
      }

      const participant = participants.find(p => p.id === registration.participantId);
      if (!participant) {
        toast({
          title: "שגיאה",
          description: "לא נמצא משתתף מתאים",
          variant: "destructive",
        });
        return;
      }

      // Update the participant's health approval status
      await updateParticipant({
        ...participant,
        healthApproval: isApproved
      });

      toast({
        title: isApproved ? "אישור בריאות עודכן" : "אישור בריאות בוטל",
        description: isApproved 
          ? "המשתתף מאושר מבחינת בריאות" 
          : "אישור הבריאות של המשתתף בוטל",
      });
    } catch (error) {
      console.error('Error updating health approval:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בעדכון אישור הבריאות",
        variant: "destructive",
      });
    }
  };

  return {
    isLinkDialogOpen,
    setIsLinkDialogOpen,
    currentHealthDeclaration,
    setCurrentHealthDeclaration,
    handleUpdateHealthApproval
  };
};
