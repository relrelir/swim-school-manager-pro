
import { toast } from '@/components/ui/use-toast';
import { Registration } from '@/types';

export const useRegistrationHandlers = (
  dataContext: any,
  setRefreshTrigger: (value: React.SetStateAction<number>) => void
) => {
  // Delete registration handler
  const handleDeleteRegistration = async (id: string) => {
    try {
      // Delete all payments associated with this registration first
      const paymentsToDelete = dataContext.getPaymentsByRegistration(id);
      for (const payment of paymentsToDelete) {
        await dataContext.deletePayment(payment.id);
      }
      
      // Then delete the registration
      await dataContext.deleteRegistration(id);
      
      toast({
        title: "נמחק בהצלחה",
        description: "הרישום נמחק בהצלחה",
      });
      
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error deleting registration:', error);
      toast({
        variant: "destructive",
        title: "שגיאה",
        description: "אירעה שגיאה במחיקת הרישום",
      });
    }
  };

  return {
    handleDeleteRegistration
  };
};
