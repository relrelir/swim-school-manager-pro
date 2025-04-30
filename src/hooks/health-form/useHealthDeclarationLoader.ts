
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getHealthDeclarationByToken } from '@/context/data/healthDeclarations/service';
import { supabase } from '@/integrations/supabase/client';

export const useHealthDeclarationLoader = () => {
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [participantName, setParticipantName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [healthDeclarationId, setHealthDeclarationId] = useState<string | null>(null);
  
  const location = useLocation();
  
  useEffect(() => {
    const pathParts = location.pathname.split('/');
    const token = pathParts[pathParts.length - 1];
    
    if (!token) {
      setError('הקישור אינו תקין. חסר מזהה הצהרת בריאות.');
      setIsLoadingData(false);
      return;
    }
    
    const loadHealthDeclaration = async () => {
      try {
        const declaration = await getHealthDeclarationByToken(token);
        
        if (!declaration) {
          setError('לא נמצאה הצהרת בריאות תואמת.');
          setIsLoadingData(false);
          return;
        }
        
        // Check if the form is already completed
        if (declaration.formStatus === 'signed') {
          setError('הצהרת בריאות זו כבר מולאה. תודה!');
          setIsLoadingData(false);
          return;
        }
        
        setHealthDeclarationId(declaration.id);
        
        // Get participant name
        const { data: participantData, error: participantError } = await supabase
          .from('registrations')
          .select('participants(firstname, lastname)')
          .eq('id', declaration.registrationId)
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
  }, [location.pathname]);
  
  return {
    isLoadingData,
    participantName,
    error,
    healthDeclarationId
  };
};
