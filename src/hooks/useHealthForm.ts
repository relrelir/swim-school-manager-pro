
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useHealthForm = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const declarationId = searchParams.get('id');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [participantName, setParticipantName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [formState, setFormState] = useState({
    agreement: false,
    notes: '',
  });

  // Load participant details
  useEffect(() => {
    if (!declarationId) {
      setError('מזהה הצהרת בריאות חסר או לא תקין');
      setIsLoadingData(false);
      return;
    }

    const fetchDeclarationDetails = async () => {
      try {
        // First fetch the health declaration
        const { data: declarationData, error: declarationError } = await supabase
          .from('health_declarations')
          .select('*')
          .eq('id', declarationId)
          .single();

        if (declarationError || !declarationData) {
          throw new Error('הצהרת בריאות לא נמצאה');
        }

        // Check if the form is already signed
        if (declarationData.form_status === 'signed') {
          setError('הצהרת בריאות זו כבר מולאה ונחתמה');
          setIsLoadingData(false);
          return;
        }

        // Then fetch the registration to get participant details
        const registrationId = declarationData.participant_id;
        if (!registrationId) {
          throw new Error('מזהה הרשמה חסר בהצהרת הבריאות');
        }

        const { data: registrationData, error: registrationError } = await supabase
          .from('registrations')
          .select('*')
          .eq('id', registrationId)
          .single();
          
        if (registrationError || !registrationData) {
          throw new Error('לא נמצאה הרשמה תואמת להצהרת בריאות זו');
        }

        // Get the participant ID from registration
        const participantId = registrationData.participantid;
        if (!participantId) {
          throw new Error('מזהה משתתף חסר בהרשמה');
        }

        // Finally fetch the participant details
        const { data: participantData, error: participantError } = await supabase
          .from('participants')
          .select('firstname, lastname')
          .eq('id', participantId)
          .single();

        if (participantError || !participantData) {
          throw new Error('פרטי המשתתף לא נמצאו');
        }

        // Set participant name
        setParticipantName(`${participantData.firstname} ${participantData.lastname}`);
      } catch (error) {
        console.error('Error fetching declaration details:', error);
        setError(error instanceof Error ? error.message : 'אירעה שגיאה בטעינת פרטי הצהרת הבריאות');
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchDeclarationDetails();
  }, [declarationId]);

  const handleAgreementChange = (checked: boolean) => {
    setFormState({ ...formState, agreement: checked });
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormState({ ...formState, notes: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!declarationId) {
      toast({
        title: "שגיאה",
        description: "מזהה הצהרת בריאות חסר או לא תקין",
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
      // Update the health declaration in the database
      const { error: healthDeclarationError } = await supabase
        .from('health_declarations')
        .update({
          form_status: 'signed',
          submission_date: new Date().toISOString(),
          notes: formState.notes
        })
        .eq('id', declarationId);
      
      if (healthDeclarationError) {
        throw new Error(healthDeclarationError.message);
      }

      // Get the registration ID from the health declaration
      const { data: healthDecData, error: healthDecFetchError } = await supabase
        .from('health_declarations')
        .select('participant_id') // This is the registration ID
        .eq('id', declarationId)
        .single();

      if (healthDecFetchError || !healthDecData) {
        throw new Error('לא ניתן למצוא את ההרשמה המקושרת להצהרת בריאות זו');
      }

      const registrationId = healthDecData.participant_id;

      // Get participant ID from the registration
      const { data: registrationData, error: registrationError } = await supabase
        .from('registrations')
        .select('participantid')
        .eq('id', registrationId)
        .single();

      if (registrationError || !registrationData) {
        throw new Error('לא ניתן למצוא את המשתתף המקושר להצהרת בריאות זו');
      }

      // Update the participant's health approval status
      const { error: participantError } = await supabase
        .from('participants')
        .update({
          healthapproval: true
        })
        .eq('id', registrationData.participantid);

      if (participantError) {
        throw new Error(participantError.message);
      }
      
      // Navigate to success page
      navigate('/form-success');
    } catch (error: any) {
      console.error('Error submitting health form:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בשמירת הצהרת הבריאות",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    declarationId,
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
