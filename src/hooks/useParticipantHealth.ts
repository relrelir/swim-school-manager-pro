
import { Participant } from '@/types';
import { toast } from "@/components/ui/use-toast";
import { useHealthDeclarationDialog } from './useHealthDeclarationDialog';

export const useParticipantHealth = (
  getHealthDeclarationForRegistration: (registrationId: string) => any,
  addHealthDeclaration: (declaration: Omit<any, 'id'>) => Promise<any>,
  updateParticipant: (participant: Participant) => void,
  participants: Participant[],
  registrations: any[]
) => {
  // Use the extracted dialog functionality
  const {
    isLinkDialogOpen,
    setIsLinkDialogOpen,
    currentHealthDeclaration,
    setCurrentHealthDeclaration,
    handleOpenHealthForm: baseHandleOpenHealthForm
  } = useHealthDeclarationDialog(getHealthDeclarationForRegistration, addHealthDeclaration);

  // Wrapper function for opening health form with stored participants and registrations
  const handleOpenHealthForm = (registrationId: string) => {
    return baseHandleOpenHealthForm(registrationId, participants, registrations);
  };

  // Handle updating health approval
  const handleUpdateHealthApproval = (registrationId: string, isApproved: boolean) => {
    // Find the corresponding registration and participant
    const registration = registrations.find(reg => reg.id === registrationId);
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
