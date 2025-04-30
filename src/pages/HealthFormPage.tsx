
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

const HealthFormPage: React.FC = () => {
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
        const { data: registrationData, error: registrationError } = await supabase
          .from('registrations')
          .select('participantid')
          .eq('id', declarationData.registration_id)
          .single();
          
        if (registrationError || !registrationData) {
          throw new Error('לא נמצאה הרשמה תואמת להצהרת בריאות זו');
        }

        // Finally fetch the participant details
        const { data: participantData, error: participantError } = await supabase
          .from('participants')
          .select('firstname, lastname')
          .eq('id', registrationData.participantid)
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
          signed_at: new Date().toISOString(),
          client_answer: JSON.stringify(formState),
          notes: formState.notes
        })
        .eq('id', declarationId);
      
      if (healthDeclarationError) {
        throw new Error(healthDeclarationError.message);
      }

      // Get the participant ID from the registration linked to this declaration
      const { data: healthDecData, error: healthDecFetchError } = await supabase
        .from('health_declarations')
        .select('registration_id')
        .eq('id', declarationId)
        .single();

      if (healthDecFetchError || !healthDecData) {
        throw new Error('לא ניתן למצוא את ההרשמה המקושרת להצהרת בריאות זו');
      }

      const { data: registrationData, error: registrationError } = await supabase
        .from('registrations')
        .select('participantid')
        .eq('id', healthDecData.registration_id)
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

  // Show error state
  if (error) {
    return (
      <Card className="w-full max-w-md mx-auto mt-10">
        <CardHeader>
          <CardTitle>שגיאה</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Loading state
  if (isLoadingData) {
    return (
      <div className="container mx-auto py-10 px-4">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-32 w-full" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-full" />
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>הצהרת בריאות</CardTitle>
          <CardDescription>
            {participantName ? `עבור ${participantName}` : 'אנא מלא את הפרטים הבאים והצהר על בריאות המשתתף'}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-2 space-y-0">
                <Label 
                  htmlFor="health-declaration" 
                  className="flex-grow text-base font-medium"
                >
                  אני מצהיר/ה בזאת כי:
                </Label>
              </div>
              
              <div className="text-sm space-y-2 rounded-md border p-4">
                <p>• בני/בתי נמצא/ת בכושר ובמצב בריאותי תקין המאפשר השתתפות בפעילות.</p>
                <p>• לא ידוע לי על מגבלות רפואיות המונעות מבני/בתי להשתתף בפעילות.</p>
                <p>• לא ידוע לי על רגישויות, מחלות או בעיות רפואיות אחרות שעלולות להשפיע על השתתפותו/ה בפעילות.</p>
                <p>• אני מתחייב/ת להודיע למדריכים על כל שינוי במצב הבריאותי של בני/בתי.</p>
              </div>
              
              <div className="flex items-center space-x-2 space-y-0 pt-2">
                <Checkbox 
                  id="health-agreement" 
                  checked={formState.agreement}
                  onCheckedChange={checked => handleAgreementChange(checked === true)}
                  required
                />
                <Label 
                  htmlFor="health-agreement" 
                  className="mr-2 text-sm"
                >
                  אני מאשר/ת את הצהרת הבריאות
                </Label>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">הערות רפואיות (אופציונלי)</Label>
              <Textarea 
                id="notes" 
                placeholder="אם יש מידע רפואי נוסף שעלינו לדעת, אנא ציין כאן"
                value={formState.notes}
                onChange={handleNotesChange}
              />
            </div>
          </CardContent>
          
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading || !formState.agreement}>
              {isLoading ? 'שולח...' : 'אישור הצהרה'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default HealthFormPage;
