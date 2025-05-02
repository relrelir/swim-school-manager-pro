
import { Registration, Participant } from '@/types';

/**
 * Hook for handling add participant interactions
 */
export const useAddParticipantHandler = (
  baseHandleAddParticipant: (
    e: React.FormEvent, 
    newParticipant: any, 
    registrationData: any, 
    resetForm: () => void, 
    setIsAddParticipantOpen: (open: boolean) => void,
    getParticipantForRegistration: (registration: Registration) => Participant | undefined
  ) => any,
  newParticipant: any,
  registrationData: any,
  getParticipantForRegistration: (registration: Registration) => Participant | undefined
) => {
  const handleAddParticipant = (e: React.FormEvent, resetForm: () => void, setIsAddParticipantOpen: (open: boolean) => void) => {
    return baseHandleAddParticipant(
      e, 
      newParticipant, 
      registrationData, 
      resetForm, 
      setIsAddParticipantOpen,
      getParticipantForRegistration
    );
  };

  return {
    handleAddParticipant
  };
};
