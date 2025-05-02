
import { Participant, Registration } from '@/types';

/**
 * Hook for adapting participant functions to expected signatures
 */
export const useActionAdapters = (
  updateParticipant: (participant: Participant) => void
) => {
  // Create an adapter for updateParticipant to match the expected signature
  const adaptedUpdateParticipant = async (id: string, data: Partial<Participant>): Promise<Participant> => {
    // Create a participant object that satisfies the Participant type
    const participantToUpdate = {
      id,
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      phone: data.phone || '',
      healthApproval: data.healthApproval !== undefined ? data.healthApproval : false,
      idNumber: data.idNumber || '',
      ...data
    } as Participant;
    
    await updateParticipant(participantToUpdate);
    return participantToUpdate;
  };

  return {
    adaptedUpdateParticipant
  };
};
