
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { submitHealthFormService } from '@/context/data/healthDeclarations/service';
import { supabase } from '@/integrations/supabase/client';

interface HealthFormState {
  agreement: boolean;
  notes: string;
}

export const useHealthFormState = (healthDeclarationId: string | null) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formState, setFormState] = useState<HealthFormState>({
    agreement: false,
    notes: ''
  });
  
  const navigate = useNavigate();
  
  const handleAgreementChange = (checked: boolean) => {
    setFormState(prev => ({
      ...prev,
      agreement: checked
    }));
  };
  
  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormState(prev => ({
      ...prev,
      notes: e.target.value
    }));
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
        description: "יש לאשר את הצהרת הבריאות",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Submit the health form
      const registrationId = await submitHealthFormService(
        healthDeclarationId, 
        formState.agreement, 
        formState.notes
      );
      
      // Update participant health approval
      if (registrationId) {
        // First get the participant ID from registration
        const { data: registrationData, error: registrationError } = await supabase
          .from('registrations')
          .select('participantid')
          .eq('id', registrationId)
          .single();
        
        if (registrationError || !registrationData) {
          console.error('Error fetching registration data:', registrationError);
        } else {
          const participantId = registrationData.participantid;
          
          // Update participant's health approval status
          if (participantId) {
            const { error: updateError } = await supabase
              .from('participants')
              .update({ healthapproval: true })
              .eq('id', participantId);
            
            if (updateError) {
              console.error('Error updating participant health approval:', updateError);
            }
          }
        }
      }
      
      toast({
        title: "תודה!",
        description: "הצהרת הבריאות התקבלה בהצלחה",
      });
      
      // Redirect to success page
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
