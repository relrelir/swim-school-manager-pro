
import { useParams } from 'react-router-dom';
import { useData } from '@/context/DataContext';
import { Registration } from '@/types';
import { useParticipantCore } from './participants/useParticipantCore';
import { useParticipantActions } from './participants/useParticipantActions';
import { useParticipantsContext } from '@/context/data/ParticipantsProvider';
import { toast } from '@/components/ui/use-toast';

/**
 * Main hook for participants management - now acts as a composition layer
 * for more focused participant-related hooks
 */
export const useParticipants = () => {
  const { productId } = useParams<{ productId: string }>();
  const dataContext = useData();
  
  // Get participants context directly for the missing properties
  const { 
    participants: allParticipants, 
    addParticipant,
    updateParticipant,
    deleteParticipant,
    loading: participantsLoading
  } = useParticipantsContext();
  
  // Separate core functionality (data loading, state management)
  const core = useParticipantCore(productId, dataContext);
  
  // Separate actions (handlers, operations)
  const actions = useParticipantActions(
    productId,
    dataContext,
    core.participants,
    core.registrations,
    core.product,
    core.setRefreshTrigger,
    core.newParticipant,
    core.registrationData,
    core.getParticipantForRegistration,
    core.setIsAddParticipantOpen,
    core.setIsAddPaymentOpen,
    core.setNewPayment,
    core.newPayment,
    core.resetForm,
    core.currentRegistration
  );

  // This is a simplified version of handleAddParticipant to work with the AddParticipantDialog
  const handleAddParticipant = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!productId) return;
    
    // Validation
    if (!core.newParticipant.firstName || !core.newParticipant.lastName || 
        !core.newParticipant.idNumber || !core.newParticipant.phone || 
        !core.registrationData.receiptNumber) {
      toast({
        variant: "destructive",
        title: "שגיאה",
        description: "יש למלא את כל השדות הנדרשים",
      });
      return;
    }
    
    try {
      // Add participant first
      const participant = await addParticipant(core.newParticipant);
      
      if (participant) {
        // Then add registration
        const newRegistration: Omit<Registration, 'id'> = {
          productId,
          participantId: participant.id,
          requiredAmount: core.registrationData.requiredAmount,
          paidAmount: core.registrationData.paidAmount,
          receiptNumber: core.registrationData.receiptNumber,
          discountApproved: core.registrationData.discountApproved,
          registrationDate: new Date().toISOString(),
        };
        
        await dataContext.addRegistration(newRegistration);
        
        // Add initial payment if needed
        if (core.registrationData.paidAmount > 0) {
          // Get the new registration to get its ID
          const updatedRegs = dataContext.getRegistrationsByProduct(productId);
          const addedRegistration = updatedRegs.find(
            r => r.participantId === participant.id && r.productId === productId
          );
          
          if (addedRegistration) {
            await dataContext.addPayment({
              registrationId: addedRegistration.id,
              amount: core.registrationData.paidAmount,
              receiptNumber: core.registrationData.receiptNumber,
              paymentDate: new Date().toISOString()
            });
          }
        }
        
        toast({
          title: "נרשם בהצלחה",
          description: `${participant.firstName} ${participant.lastName} נרשם בהצלחה`,
        });
        
        // Reset form and close dialog
        core.resetForm();
        core.setIsAddParticipantOpen(false);
        
        // Trigger refresh
        core.setRefreshTrigger(prev => prev + 1);
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
    // Core data and state
    product: core.product,
    registrations: core.registrations,
    isAddParticipantOpen: core.isAddParticipantOpen,
    setIsAddParticipantOpen: core.setIsAddParticipantOpen,
    isAddPaymentOpen: core.isAddPaymentOpen,
    setIsAddPaymentOpen: core.setIsAddPaymentOpen,
    isLinkDialogOpen: core.isLinkDialogOpen,
    setIsLinkDialogOpen: core.setIsLinkDialogOpen,
    currentHealthDeclaration: core.currentHealthDeclaration,
    setCurrentHealthDeclaration: core.setCurrentHealthDeclaration,
    newParticipant: core.newParticipant,
    setNewParticipant: core.setNewParticipant,
    currentRegistration: core.currentRegistration,
    setCurrentRegistration: core.setCurrentRegistration,
    registrationData: core.registrationData,
    setRegistrationData: core.setRegistrationData,
    newPayment: core.newPayment,
    setNewPayment: core.setNewPayment,
    totalParticipants: core.totalParticipants,
    registrationsFilled: core.registrationsFilled,
    totalExpected: core.totalExpected,
    totalPaid: core.totalPaid,
    participants: core.participants,
    loading: participantsLoading || core.loading,

    // Override handleAddParticipant with our simplified version
    handleAddParticipant,
    
    // Actions and handlers
    handleAddPayment: actions.handleAddPayment,
    handleApplyDiscount: actions.handleApplyDiscount,
    handleDeleteRegistration: actions.handleDeleteRegistration,
    handleUpdateHealthApproval: actions.handleUpdateHealthApproval,
    handleOpenHealthForm: actions.handleOpenHealthForm,
    
    // Utility functions
    resetForm: core.resetForm,
    getParticipantForRegistration: core.getParticipantForRegistration,
    getPaymentsForRegistration: core.getPaymentsForRegistration,
    getStatusClassName: core.getStatusClassName,
    calculatePaymentStatus: core.calculatePaymentStatus,
    getHealthDeclarationForRegistration: core.getHealthDeclarationForRegistration,
    
    // Add missing properties from participants context
    addParticipant,
    updateParticipant,
    deleteParticipant
  };
};
