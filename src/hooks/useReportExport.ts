
import { toast } from '@/components/ui/use-toast';
import { exportRegistrationsToCSV } from '@/utils/exportUtils';
import { RegistrationWithDetails } from '@/types';

export const useReportExport = () => {
  const handleExport = (filteredRegistrations: RegistrationWithDetails[]) => {
    if (filteredRegistrations.length === 0) {
      toast({
        title: "אין נתונים לייצוא",
        description: "לא נמצאו רשומות התואמות את הפילטרים",
        variant: "destructive",
      });
      return;
    }
    
    try {
      exportRegistrationsToCSV(
        filteredRegistrations,
        `דוח-רישומים-${new Date().toISOString().slice(0, 10)}.csv`
      );
      
      toast({
        title: "הייצוא הושלם בהצלחה",
        description: `יוצאו ${filteredRegistrations.length} רשומות לקובץ CSV`,
      });
    } catch (error) {
      toast({
        title: "שגיאה בייצוא",
        description: "אירעה שגיאה בעת ייצוא הנתונים",
        variant: "destructive",
      });
    }
  };

  return { handleExport };
};
