
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getHealthDeclarationById, submitHealthFormService } from '@/context/data/healthDeclarations/service';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useHealthForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [participantName, setParticipantName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [healthDeclarationId, setHealthDeclarationId] = useState<string | null>(null);
  const [formState, setFormState] = useState({
    agreement: false,
    notes: ''
  });
  
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const declarationId = queryParams.get('id');
    
    if (!declarationId) {
      setError('הקישור אינו תקין. חסר מזהה הצהרת בריאות.');
      setIsLoadingData(false);
      return;
    }
    
    setHealthDeclarationId(declarationId);
    
    const loadHealthDeclaration = async () => {
      try {
        const declaration = await getHealthDeclarationById(declarationId);
        
        if (!declaration) {
          setError('לא נמצאה הצהרת בריאות תואמת.');
          setIsLoadingData(false);
          return;
        }
        
        if (declaration.formStatus === 'completed') {
          setError('הצהרת בריאות זו כבר מולאה. תודה!');
          setIsLoadingData(false);
          return;
        }
        
        // Get participant name
        const { data: participantData, error: participantError } = await supabase
          .from('registrations')
          .select('participants(firstname, lastname)')
          .eq('id', declaration.participant_id)
          .single();
        
        if (participantError || !participantData) {
          console.error('Error fetching participant data:', participantError);
        } else if (participantData.participants) {
          const participant = participantData.participants;
          setParticipantName(`${participant.firstname} ${participant.lastname}`);
        }
        
        setIsLoadingData(false);
      } catch (error) {
        console.error('Error loading health declaration:', error);
        setError('אירעה שגיאה בטעינת הצהרת הבריאות.');
        setIsLoadingData(false);
      }
    };
    
    loadHealthDeclaration();
  }, [location.search]);
  
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
    isLoadingData,
    participantName,
    error,
    formState,
    handleAgreementChange,
    handleNotesChange,
    handleSubmit
  };
};
