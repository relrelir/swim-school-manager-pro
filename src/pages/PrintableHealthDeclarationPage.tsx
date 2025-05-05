
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import PrintableHealthDeclaration from '@/components/health-form/PrintableHealthDeclaration';
import { getHealthDeclarationById } from '@/context/data/healthDeclarations/service';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { handleSupabaseError } from '@/context/data/utils';
import { parseParentInfo, parseMedicalNotes } from '@/utils/pdf/healthDeclarationParser';

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
        console.log("Raw notes field:", healthDeclaration.notes);

        // Fetch participant data
        const { data: participant, error: participantError } = await supabase
          .from('participants')
          .select('*')
          .eq('id', healthDeclaration.participant_id)
          .maybeSingle();

        if (participantError) {
          handleSupabaseError(participantError, 'fetching participant');
          throw new Error('שגיאה בטעינת פרטי המשתתף');
        }

        if (!participant) {
          throw new Error('לא נמצאו פרטי המשתתף');
        }
        
        console.log("Found participant:", participant);

        // Parse parent information and medical notes separately with improved parsing
        // Use the improved parsers to correctly extract information
        const parentInfo = parseParentInfo(healthDeclaration.notes || '');
        const medicalNotes = parseMedicalNotes(healthDeclaration.notes || '');
        
        console.log("Parsed parent info:", parentInfo);
        console.log("Parsed medical notes:", medicalNotes);

        // Set health data with properly separated fields
        setHealthData({
          participantName: `${participant.firstname} ${participant.lastname}`,
          participantId: participant.idnumber,
          participantPhone: participant.phone,
          formState: {
            agreement: true,
            notes: medicalNotes, // Use the correctly parsed medical notes
            parentName: parentInfo.parentName, // Use the correctly parsed parent name
            parentId: parentInfo.parentId // Use the correctly parsed parent ID
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
      {!isLoading && !error && healthData && (
        <PrintableHealthDeclaration
          participantName={healthData.participantName}
          participantId={healthData.participantId}
          participantPhone={healthData.participantPhone}
          formState={healthData.formState}
          submissionDate={healthData.submissionDate}
        />
      )}
    </div>
  );
};

export default PrintableHealthDeclarationPage;
