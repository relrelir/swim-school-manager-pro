
import { useState, useEffect, useCallback } from 'react';
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
  
  // הפיכת loadHealthDeclaration לפונקציה ממוקשת לשיפור ביצועים
  const loadHealthDeclaration = useCallback(async () => {
    if (!token) {
      setError('מזהה הצהרת בריאות חסר בקישור');
      setIsLoadingData(false);
      return;
    }
    
    try {
      // Fetch everything in a single query with proper joins to reduce network requests
      // First getting the health declaration and participant in one query
      const { data: healthDeclarationData, error: healthDeclarationError } = await supabase
        .from('health_declarations')
        .select(`
          id, 
          participant_id,
          participants:participant_id (firstname, lastname, idnumber, phone)
        `)
        .eq('token', token)
        .single();
      
      if (healthDeclarationError || !healthDeclarationData) {
        setError('הצהרת בריאות לא נמצאה או שפג תוקפה');
        setIsLoadingData(false);
        return;
      }
      
      setHealthDeclarationId(healthDeclarationData.id);
      
      // Extract participant data directly from the joined query
      const participantData = healthDeclarationData.participants;
      
      if (!participantData) {
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
  }, [token]);
  
  useEffect(() => {
    loadHealthDeclaration();
  }, [loadHealthDeclaration]);
  
  return {
    isLoadingData,
    participantName,
    participantId,
    participantPhone,
    error,
    healthDeclarationId
  };
};
