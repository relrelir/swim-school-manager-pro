
import { toast } from '@/components/ui/use-toast';
import { Participant, Registration } from '@/types';

export const useHealthHandlers = (
  dataContext: any,
  setRefreshTrigger: (value: React.SetStateAction<number>) => void,
  setCurrentHealthDeclaration: React.Dispatch<React.SetStateAction<any>>,
  updateParticipant: (participant: Participant) => void
) => {
  // Update health approval handler
  const handleUpdateHealthApproval = async (registrationId: string, isApproved: boolean) => {
    try {
      // Find the registration
      const registration = dataContext.registrations.find((r: Registration) => r.id === registrationId);
      
      if (registration) {
        // Find the participant
        const participant = dataContext.participants.find((p: Participant) => p.id === registration.participantId);
        
        if (participant) {
          // Update the participant's health approval status
          const updatedParticipant = {
            ...participant,
            healthApproval: isApproved
          };
          
          await updateParticipant(updatedParticipant);
          
          toast({
            title: "עודכן בהצלחה",
            description: `סטטוס הצהרת הבריאות עודכן ל${isApproved ? 'אושר' : 'לא אושר'}`,
          });
          
          setRefreshTrigger(prev => prev + 1);
        }
      }
    } catch (error) {
      console.error('Error updating health approval:', error);
      toast({
        variant: "destructive",
        title: "שגיאה",
        description: "אירעה שגיאה בעדכון סטטוס הצהרת הבריאות",
      });
    }
  };

  // Open health form handler
  const handleOpenHealthForm = async (registrationId: string) => {
    try {
      // Find the registration
      const registration = dataContext.registrations.find((r: Registration) => r.id === registrationId);
      
      if (registration) {
        // Find the participant
        const participant = dataContext.participants.find((p: Participant) => p.id === registration.participantId);
        
        if (participant) {
          // Get the health declaration for this registration
          const declaration = await dataContext.getHealthDeclarationForRegistration(registrationId);
          
          // Set the current health declaration
          setCurrentHealthDeclaration({
            registrationId,
            participantName: `${participant.firstName} ${participant.lastName}`,
            phone: participant.phone,
            declaration
          });
        }
      }
    } catch (error) {
      console.error('Error opening health form:', error);
      toast({
        variant: "destructive",
        title: "שגיאה",
        description: "אירעה שגיאה בפתיחת טופס הצהרת הבריאות",
      });
    }
  };

  return {
    handleUpdateHealthApproval,
    handleOpenHealthForm
  };
};
