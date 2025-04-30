
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitHealthFormService } from '@/context/data/healthDeclarations/service';
import { toast } from "@/components/ui/use-toast";

interface FormState {
  agreement: boolean;
  notes: string;
}

export const useHealthFormState = (healthDeclarationId: string | null) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formState, setFormState] = useState<FormState>({
    agreement: false,
    notes: ''
  });
  
  const handleAgreementChange = (value: boolean) => {
    setFormState(prev => ({ ...prev, agreement: value }));
  };
  
  const handleNotesChange = (value: string) => {
    setFormState(prev => ({ ...prev, notes: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!healthDeclarationId) {
      toast({
        title: "שגיאה",
        description: "מזהה הצהרת בריאות חסר",
        variant: "destructive",
      });
      return;
    }
    
    if (!formState.agreement) {
      toast({
        title: "שגיאה",
        description: "יש לאשר את הצהרת הבריאות כדי להמשיך",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      await submitHealthFormService(
        healthDeclarationId,
        formState.agreement,
        formState.notes || undefined
      );
      
      toast({
        title: "הצהרת הבריאות נשלחה בהצלחה",
        description: "תודה על מילוי הטופס",
      });
      
      navigate('/form-success');
    } catch (error) {
      console.error('Error submitting health form:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בשליחת הצהרת הבריאות",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    isLoading,
    formState,
    handleAgreementChange,
    handleNotesChange,
    handleSubmit
  };
};
