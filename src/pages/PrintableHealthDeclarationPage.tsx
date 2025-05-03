
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import PrintableHealthDeclaration from '@/components/health-form/PrintableHealthDeclaration';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { handleSupabaseError } from '@/context/data/utils';

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
        
        // Get health declaration directly
        const { data: healthDeclaration, error: healthDeclarationError } = await supabase
          .from('health_declarations')
          .select('*')
          .eq('id', declarationId)
          .maybeSingle();

        if (healthDeclarationError) {
          handleSupabaseError(healthDeclarationError, 'fetching health declaration');
          throw new Error('שגיאה בטעינת הצהרת הבריאות');
        }

        if (!healthDeclaration) {
          throw new Error('לא נמצאה הצהרת בריאות');
        }

        console.log("Found health declaration:", healthDeclaration);

        // Try two methods to get participant data:
        // 1. First try directly using participant_id from health declaration
        let participantData = null;
        let participantError = null;
        
        if (healthDeclaration.participant_id) {
          const participantResponse = await supabase
            .from('participants')
            .select('*')
            .eq('id', healthDeclaration.participant_id)
            .maybeSingle();
            
          participantData = participantResponse.data;
          participantError = participantResponse.error;
          
          if (participantData) {
            console.log("Found participant directly:", participantData);
          }
        }
        
        // 2. If not found, try via registration
        if (!participantData && !participantError) {
          console.log("Trying to find participant through registration lookup");
          
          // Try to get the registration using health declaration's participant_id
          const { data: registration, error: registrationError } = await supabase
            .from('registrations')
            .select('*')
            .eq('id', healthDeclaration.participant_id)
            .maybeSingle();
          
          if (registration && !registrationError) {
            console.log("Found registration:", registration);
            
            // Get participant using participant ID from registration
            const { data: participantFromReg, error: participantFromRegError } = await supabase
              .from('participants')
              .select('*')
              .eq('id', registration.participantid)
              .maybeSingle();
              
            if (participantFromReg && !participantFromRegError) {
              participantData = participantFromReg;
              console.log("Found participant via registration:", participantData);
            } else {
              console.error("Failed to find participant via registration:", participantFromRegError);
            }
          } else {
            console.log("Couldn't find registration:", registrationError);
          }
        }

        if (!participantData) {
          throw new Error('לא נמצאו פרטי המשתתף');
        }
        
        // Parse parent information from notes if available
        let parentName = '';
        let parentId = '';
        let notes = healthDeclaration.notes || '';

        const parentMatch = notes.match(/הורה\/אפוטרופוס: ([^,]+), ת\.ז\.: ([^\n]+)/);
        if (parentMatch) {
          parentName = parentMatch[1].trim();
          parentId = parentMatch[2].trim();
          notes = notes.replace(/הורה\/אפוטרופוס: [^,]+, ת\.ז\.: [^\n]+\n\n/g, '').trim();
        }

        // Validate ID number
        const validatedId = participantData.idnumber && 
                          /^[\d\s\-]+$/.test(participantData.idnumber) ? 
                          participantData.idnumber : '';

        setHealthData({
          participantName: `${participantData.firstname} ${participantData.lastname}`,
          participantId: validatedId,
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
