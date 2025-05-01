
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import PrintableHealthDeclaration from '@/components/health-form/PrintableHealthDeclaration';
import { getHealthDeclarationById } from '@/context/data/healthDeclarations/service';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
        const result = await getHealthDeclarationById(declarationId);
        
        if (!result || !result.participant) {
          throw new Error('לא נמצאה הצהרת בריאות');
        }

        // Parse parent information from notes if available
        let parentName = '';
        let parentId = '';
        let notes = result.notes || '';

        const parentMatch = notes.match(/הורה\/אפוטרופוס: ([^,]+), ת\.ז\.: ([^\n]+)/);
        if (parentMatch) {
          parentName = parentMatch[1].trim();
          parentId = parentMatch[2].trim();
          notes = notes.replace(/הורה\/אפוטרופוס: [^,]+, ת\.ז\.: [^\n]+\n\n/g, '').trim();
        }

        setHealthData({
          participantName: `${result.participant.firstname} ${result.participant.lastname}`,
          participantId: result.participant.idnumber,
          participantPhone: result.participant.phone,
          formState: {
            agreement: true,
            notes: notes,
            parentName: parentName,
            parentId: parentId
          },
          submissionDate: result.submission_date ? new Date(result.submission_date) : new Date()
        });
      } catch (error) {
        console.error('Error loading health declaration:', error);
        setError('אירעה שגיאה בטעינת הצהרת הבריאות');
      } finally {
        setIsLoading(false);
      }
    };

    loadHealthDeclaration();
  }, [declarationId]);

  if (isLoading) {
    return (
      <div className="container py-10">
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
      <div className="container py-10">
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
