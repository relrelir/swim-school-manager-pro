import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import PrintableHealthDeclaration from '@/components/health-form/PrintableHealthDeclaration';
import { getHealthDeclarationById } from '@/context/data/healthDeclarations/service';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { handleSupabaseError } from '@/context/data/utils';
import { containsHebrew } from '@/utils/pdf/hebrewTextHelper';

// Validate if a string is likely to be a valid ID number
const isValidId = (id: string | undefined): boolean => {
  if (!id) return false;
  
  // Check if it has digits and doesn't contain Hebrew characters
  return /\d/.test(id) && !containsHebrew(id);
};

// Sanitize an ID to ensure it's usable
const sanitizeId = (id: string | undefined): string => {
  if (!id) return '';
  
  return isValidId(id) ? id : '';
};

const PrintableHealthDeclarationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const declarationId = searchParams.get('id');
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [healthData, setHealthData] = useState<{
    participantName: string;
    participantId?: string;
    participantPhone?: string;
    formState: {
      agreement: boolean;
      notes: string;
      parentName: string;
      parentId: string;
    };
    submissionDate?: Date;
  } | null>(null);

  useEffect(() => {
    const loadHealthDeclaration = async () => {
      if (!declarationId) {
        setError('מזהה הצהרת בריאות חסר');
        setIsLoading(false);
        return;
      }

      try {
        console.log("Loading health declaration with ID:", declarationId);
        const healthDeclaration = await getHealthDeclarationById(declarationId);
        
        if (!healthDeclaration) {
          throw new Error('לא נמצאה הצהרת בריאות');
        }

        console.log("Found health declaration:", healthDeclaration);
        console.log("Participant ID in health declaration:", healthDeclaration.participant_id);

        // participant_id in health declarations actually contains the registration ID
        // We need to get the registration to find the correct participant
        const { data: registrationData, error: registrationError } = await supabase
          .from('registrations')
          .select('*')
          .eq('id', healthDeclaration.participant_id)
          .maybeSingle();

        if (registrationError) {
          handleSupabaseError(registrationError, 'fetching registration');
          throw new Error('שגיאה בטעינת פרטי הרישום');
        }

        if (!registrationData) {
          throw new Error('לא נמצאו פרטי רישום');
        }

        console.log("Found registration:", registrationData);
        
        // Get the participant using the participantId from the registration
        const { data: participantData, error: participantError } = await supabase
          .from('participants')
          .select('*')
          .eq('id', registrationData.participantid)
          .maybeSingle();

        if (participantError) {
          handleSupabaseError(participantError, 'fetching participant');
          throw new Error('שגיאה בטעינת פרטי המשתתף');
        }

        if (!participantData) {
          throw new Error('לא נמצאו פרטי המשתתף');
        }
        
        console.log("Found participant:", participantData);
        console.log("Participant ID number:", participantData.idnumber);

        // Validate ID number - if it contains Hebrew, clear it
        const sanitizedIdNumber = sanitizeId(participantData.idnumber);
        console.log("Sanitized ID number:", sanitizedIdNumber);

        // Parse parent information from notes if available
        let parentName = '';
        let parentId = '';
        let notes = healthDeclaration.notes || '';

        const parentMatch = notes.match(/הורה\/אפוטרופוס: ([^,]+), ת\.ז\.: ([^\n]+)/);
        if (parentMatch) {
          parentName = parentMatch[1].trim();
          parentId = parentMatch[2].trim();
          
          // Also validate parent ID
          parentId = sanitizeId(parentId);
          
          notes = notes.replace(/הורה\/אפוטרופוס: [^,]+, ת\.ז\.: [^\n]+\n\n/g, '').trim();
        }

        setHealthData({
          participantName: `${participantData.firstname} ${participantData.lastname}`,
          participantId: sanitizedIdNumber,
          participantPhone: participantData.phone,
          formState: {
            agreement: true,
            notes: notes,
            parentName: parentName,
            parentId: parentId
          },
          submissionDate: healthDeclaration.submission_date ? new Date(healthDeclaration.submission_date) : new Date()
        });
      } catch (error) {
        console.error('Error loading health declaration:', error);
        setError(error instanceof Error ? error.message : 'אירעה שגיאה בטעינת הצהרת הבריאות');
      } finally {
        setIsLoading(false);
      }
    };

    loadHealthDeclaration();
  }, [declarationId]);

  if (isLoading) {
    return (
      <div className="container py-10" dir="rtl">
        <Card className="max-w-3xl mx-auto">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center p-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <p className="mt-4">טוען הצהרת בריאות...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !healthData) {
    return (
      <div className="container py-10" dir="rtl">
        <Alert variant="destructive" className="max-w-3xl mx-auto">
          <AlertDescription>{error || 'אירעה שגיאה בטעינת הצהרת הבריאות'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <PrintableHealthDeclaration
        participantName={healthData.participantName}
        participantId={healthData.participantId}
        participantPhone={healthData.participantPhone}
        formState={healthData.formState}
        submissionDate={healthData.submissionDate}
      />
    </div>
  );
};

export default PrintableHealthDeclarationPage;
