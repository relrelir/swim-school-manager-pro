
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getHealthDeclarationById } from '@/context/data/healthDeclarations/service';
import { supabase } from '@/integrations/supabase/client';

export const useHealthDeclarationLoader = () => {
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [participantName, setParticipantName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [healthDeclarationId, setHealthDeclarationId] = useState<string | null>(null);
  
  const location = useLocation();
  
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
        
        // Check if the form is already completed
        const formStatusValue = declaration.form_status || declaration.formStatus;
        if (formStatusValue === 'completed') {
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
  
  return {
    isLoadingData,
    participantName,
    error,
    healthDeclarationId
  };
};
