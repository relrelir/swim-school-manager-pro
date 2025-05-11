
import { toast } from "@/components/ui/use-toast";
import { Participant, Registration, Payment } from '@/types';

export const useRegistrationHandlers = (
  addParticipant: (participant: Omit<Participant, 'id'>) => Promise<Participant | undefined> | void,
  addRegistration: (registration: Omit<Registration, 'id'>) => Promise<Registration | undefined> | void,
  updateParticipant: (participant: Participant) => void,
  deleteRegistration: (id: string) => void,
  addPayment: (payment: Omit<Payment, 'id'>) => Promise<Payment | undefined> | void,
  getPaymentsByRegistration: (registrationId: string) => Payment[],
  getRegistrationsByProduct: (productId: string) => Registration[]
) => {
  // Handle adding a new participant and registration
  const handleAddParticipant = async (
    e: React.FormEvent, 
    productId: string | undefined, 
    newParticipant: Omit<Participant, 'id'>, 
    registrationData: {
      requiredAmount: number;
      paidAmount: number;
      receiptNumber: string;
      discountApproved: boolean;
    },
    resetForm: () => void,
    setIsAddParticipantOpen: (open: boolean) => void
  ) => {
    e.preventDefault();
    
    // If we don't have a product, return
    if (!productId) return [];
    
    console.log("Starting handleAddParticipant with data:", {
      productId,
      newParticipant,
      registrationData
    });
    
    // Check if we have payment and ensure receipt number is provided
    if (registrationData.paidAmount > 0 && !registrationData.receiptNumber) {
      console.error("Missing receipt number for payment");
      toast({
        title: "שגיאה",
        description: "מספר קבלה הוא שדה חובה כאשר מוזן סכום תשלום",
        variant: "destructive",
      });
      return [];
    }
    
    try {
      // Adding new participant
      const participant: Omit<Participant, 'id'> = {
        firstName: newParticipant.firstName,
        lastName: newParticipant.lastName,
        idNumber: newParticipant.idNumber,
        phone: newParticipant.phone,
        healthApproval: newParticipant.healthApproval,
      };
      
      console.log("Adding new participant:", participant);
      // Add participant first
      const addedParticipant = await addParticipant(participant);
      
      if (addedParticipant) {
        console.log("Participant added successfully:", addedParticipant);
        
        // Then add registration
        const newRegistration: Omit<Registration, 'id'> = {
          productId: productId,
          participantId: addedParticipant.id,
          requiredAmount: registrationData.requiredAmount,
          paidAmount: registrationData.paidAmount, // Set initial paid amount from form
          receiptNumber: registrationData.receiptNumber,
          discountApproved: registrationData.discountApproved,
          registrationDate: new Date().toISOString(),
        };
        
        console.log("Adding new registration:", newRegistration);
        const addedRegistration = await addRegistration(newRegistration);
        console.log("Registration added:", addedRegistration);
        
        // Add initial payment if amount is greater than 0 and we have a registration
        if (registrationData.paidAmount > 0 && addedRegistration && registrationData.receiptNumber) {
          console.log("Adding initial payment for new participant:", {
            registrationId: addedRegistration.id,
            amount: registrationData.paidAmount,
            receiptNumber: registrationData.receiptNumber
          });
          
          try {
            const initialPayment: Omit<Payment, 'id'> = {
              registrationId: addedRegistration.id,
              amount: registrationData.paidAmount,
              receiptNumber: registrationData.receiptNumber,
              paymentDate: new Date().toISOString(),
            };
            
            // Wait for the payment to be added with proper error handling
            const addedPayment = await addPayment(initialPayment);
            
            if (addedPayment) {
              console.log("Initial payment added successfully:", addedPayment);
            } else {
              console.error("Failed to add initial payment - attempting again");
              
              // If the first attempt failed, try once more with a delay
              setTimeout(async () => {
                try {
                  const retryPayment = await addPayment(initialPayment);
                  console.log("Retry payment result:", retryPayment);
                } catch (error) {
                  console.error("Error in retry payment:", error);
                }
              }, 1000);
            }
          } catch (error) {
            console.error("Error adding initial payment:", error);
            // Even if payment creation fails, we should still show a success message
            // for the participant registration
          }
        } else {
          console.log("No initial payment needed or missing data:", {
            paidAmount: registrationData.paidAmount,
            hasRegistration: !!addedRegistration,
            receiptNumber: registrationData.receiptNumber
          });
        }
        
        // Add success toast notification
        toast({
          title: "משתתף נרשם בהצלחה",
          description: `${participant.firstName} ${participant.lastName} נרשם בהצלחה`,
        });
      } else {
        console.error("Failed to add participant");
        return [];
      }
      
      // Reset form and close dialog
      resetForm();
      setIsAddParticipantOpen(false);
      
      // Refresh registrations list
      if (productId) {
        return getRegistrationsByProduct(productId);
      }
    } catch (error) {
      console.error("Error in handleAddParticipant:", error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בהוספת משתתף",
        variant: "destructive",
      });
    }
    
    return [];
  };

  // Handle deleting a registration
  const handleDeleteRegistration = async (
    registrationId: string,
    registrations: Registration[],
    productId?: string
  ) => {
    const registration = registrations.find(r => r.id === registrationId);
    if (!registration) return [];
    
    const registrationPayments = getPaymentsByRegistration(registration.id);
    
    // Only allow deletion if there are no payments
    if (registrationPayments.length > 0) {
      toast({
        title: "לא ניתן למחוק",
        description: "לא ניתן למחוק רישום שבוצע עבורו תשלום",
        variant: "destructive",
      });
      return [];
    }
    
    if (window.confirm('האם אתה בטוח שברצונך למחוק רישום זה?')) {
      await deleteRegistration(registrationId);
      
      // Refresh registrations list
      if (productId) {
        return getRegistrationsByProduct(productId);
      }
    }
    
    return [];
  };

  return {
    handleAddParticipant,
    handleDeleteRegistration,
  };
};
