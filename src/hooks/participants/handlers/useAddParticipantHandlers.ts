
import { toast } from '@/components/ui/use-toast';
import { Participant, Registration } from '@/types';

export const useAddParticipantHandlers = (
  productId: string | undefined,
  dataContext: any,
  setIsAddParticipantOpen: (open: boolean) => void,
  setRefreshTrigger: (value: React.SetStateAction<number>) => void,
  resetForm: () => void,
  newParticipant: Omit<Participant, 'id'>,
  registrationData: any,
  addParticipant: (participant: Omit<Participant, 'id'>) => Promise<Participant | undefined>
) => {
  // Add participant handler
  const handleAddParticipant = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!productId) return;
    
    // Validation
    if (!newParticipant.firstName || !newParticipant.lastName || 
        !newParticipant.idNumber || !newParticipant.phone || 
        !registrationData.receiptNumber) {
      toast({
        variant: "destructive",
        title: "שגיאה",
        description: "יש למלא את כל השדות הנדרשים",
      });
      return;
    }
    
    try {
      // Add participant first
      const participant = await addParticipant(newParticipant);
      
      if (participant) {
        // Then add registration
        const newRegistration: Omit<Registration, 'id'> = {
          productId,
          participantId: participant.id,
          requiredAmount: registrationData.requiredAmount,
          paidAmount: registrationData.paidAmount,
          receiptNumber: registrationData.receiptNumber,
          discountApproved: registrationData.discountApproved,
          registrationDate: new Date().toISOString(),
        };
        
        await dataContext.addRegistration(newRegistration);
        
        // Add initial payment if needed
        if (registrationData.paidAmount > 0) {
          // Get the new registration to get its ID
          const updatedRegs = dataContext.getRegistrationsByProduct(productId);
          const addedRegistration = updatedRegs.find(
            (r: Registration) => r.participantId === participant.id && r.productId === productId
          );
          
          if (addedRegistration) {
            await dataContext.addPayment({
              registrationId: addedRegistration.id,
              amount: registrationData.paidAmount,
              receiptNumber: registrationData.receiptNumber,
              paymentDate: new Date().toISOString()
            });
          }
        }
        
        toast({
          title: "נרשם בהצלחה",
          description: `${participant.firstName} ${participant.lastName} נרשם בהצלחה`,
        });
        
        // Reset form and close dialog
        resetForm();
        setIsAddParticipantOpen(false);
        
        // Trigger refresh
        setRefreshTrigger(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error adding participant:', error);
      toast({
        variant: "destructive",
        title: "שגיאה",
        description: "אירעה שגיאה בהוספת המשתתף",
      });
    }
  };

  return {
    handleAddParticipant
  };
};
