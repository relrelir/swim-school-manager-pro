
import { useState, useEffect } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export const useHealthDeclarationLoader = () => {
  const [searchParams] = useSearchParams();
  const params = useParams();
  
  // Look for token in both URL params and query params
  const token = params.token || searchParams.get('token');
  
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [participantName, setParticipantName] = useState('');
  const [participantId, setParticipantId] = useState('');
  const [participantPhone, setParticipantPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [healthDeclarationId, setHealthDeclarationId] = useState<string | null>(null);
  
  useEffect(() => {
    const loadHealthDeclaration = async () => {
      if (!token) {
        setError('מזהה הצהרת בריאות חסר בקישור');
        setIsLoadingData(false);
        return;
      }
      
      try {
        // Get the health declaration by token
        const { data: healthDeclarationData, error: healthDeclarationError } = await supabase
          .from('health_declarations')
          .select('id, participant_id')
          .eq('token', token)
          .single();
        
        if (healthDeclarationError || !healthDeclarationData) {
          setError('הצהרת בריאות לא נמצאה או שפג תוקפה');
          setIsLoadingData(false);
          return;
        }
        
        setHealthDeclarationId(healthDeclarationData.id);
        
        // Get the participant details
        const { data: participantData, error: participantError } = await supabase
          .from('participants')
          .select('firstname, lastname, idnumber, phone')
          .eq('id', healthDeclarationData.participant_id)
          .single();
        
        if (participantError || !participantData) {
          setError('לא נמצאו פרטי משתתף תקינים');
          setIsLoadingData(false);
          return;
        }
        
        setParticipantName(`${participantData.firstname} ${participantData.lastname}`);
        setParticipantId(participantData.idnumber);
        setParticipantPhone(participantData.phone);
        
      } catch (error) {
        console.error('Error loading health declaration:', error);
        setError('אירעה שגיאה בטעינת הצהרת הבריאות');
      } finally {
        setIsLoadingData(false);
      }
    };
    
    loadHealthDeclaration();
  }, [token]);
  
  return {
    isLoadingData,
    participantName,
    participantId,
    participantPhone,
    error,
    healthDeclarationId
  };
};
