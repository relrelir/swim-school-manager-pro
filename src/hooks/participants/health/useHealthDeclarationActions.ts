
import { Participant, Registration, HealthDeclaration } from '@/types';

/**
 * Hook for health declaration operations
 */
export const useHealthDeclarationActions = (
  getHealthDeclarationForRegistration: (registrationId: string) => HealthDeclaration | undefined,
  addHealthDeclaration: (declaration: Partial<HealthDeclaration>) => Promise<HealthDeclaration | undefined>,
  updateParticipant: (id: string, data: Partial<Participant>) => Promise<Participant>,
  participants: Participant[],
  registrations: Registration[],
  setCurrentHealthDeclaration: (healthDecl: {
    registrationId: string;
    participantName: string;
    phone: string;
    declaration?: HealthDeclaration;
  } | null) => void,
  setIsLinkDialogOpen: (isOpen: boolean) => void
) => {
  const handleOpenHealthForm = (registrationId: string) => {
    const registration = registrations.find(r => r.id === registrationId);
    if (!registration) {
      console.error('Registration not found:', registrationId);
      return;
    }

    const participant = participants.find(p => p.id === registration.participantId);
    if (!participant) {
      console.error('Participant not found for registration:', registrationId);
      return;
    }

    const declaration = getHealthDeclarationForRegistration(registrationId);
    
    setCurrentHealthDeclaration({
      registrationId,
      participantName: `${participant.firstName} ${participant.lastName}`,
      phone: participant.phone || '',
      declaration,
    });
    
    setIsLinkDialogOpen(true);
  };

  const handleUpdateHealthApproval = async (registrationId: string, isApproved: boolean) => {
    const registration = registrations.find(r => r.id === registrationId);
    if (!registration) return;

    const participant = participants.find(p => p.id === registration.participantId);
    if (!participant) return;

    try {
      await updateParticipant(participant.id, {
        healthApproval: isApproved
      });
    } catch (error) {
      console.error('Error updating health approval:', error);
    }
  };

  return {
    handleOpenHealthForm,
    handleUpdateHealthApproval
  };
};
