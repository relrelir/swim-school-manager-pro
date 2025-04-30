
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';

const HealthFormPage: React.FC = () => {
  const { formId } = useParams<{ formId: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Load health declaration form data
  useEffect(() => {
    const loadFormData = async () => {
      try {
        if (!formId) {
          setError('מזהה טופס חסר');
          setLoading(false);
          return;
        }

        const { data: healthForm, error: formError } = await supabase
          .from('health_declarations')
          .select(`
            id,
            form_status,
            participant_id,
            participants:participant_id (
              firstname,
              lastname
            )
          `)
          .eq('id', formId)
          .single();

        if (formError) {
          console.error('Error loading health form:', formError);
          setError('אירעה שגיאה בטעינת הטופס');
          setLoading(false);
          return;
        }

        if (healthForm.form_status !== 'pending') {
          setError('טופס זה כבר הושלם');
          setLoading(false);
          return;
        }

        setFormData(healthForm);
        setLoading(false);
      } catch (err) {
        console.error('Error in health form load:', err);
        setError('אירעה שגיאה בטעינת הטופס');
        setLoading(false);
      }
    };

    loadFormData();
  }, [formId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke('update-health-form', {
        body: {
          formId,
          agreed,
          notes
        }
      });

      if (error) throw new Error(error.message);

      toast({
        title: "הטופס נשלח בהצלחה",
        description: "תודה על מילוי טופס הצהרת הבריאות",
      });

      setTimeout(() => {
        navigate('/form-success');
      }, 2000);
    } catch (err: any) {
      console.error('Error submitting health form:', err);
      toast({
        title: "שגיאה בשליחת הטופס",
        description: err.message || 'אירעה שגיאה בשליחת הטופס',
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <p>טוען...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container flex flex-col items-center justify-center min-h-screen">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-500">שגיאה</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const participantName = formData?.participants 
    ? `${formData.participants.firstname} ${formData.participants.lastname}` 
    : 'משתתף';

  return (
    <div className="container flex flex-col items-center justify-center min-h-screen py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>הצהרת בריאות</CardTitle>
          <CardDescription>עבור {participantName}</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-medium">הצהרה:</h3>
              <p className="text-sm">
                אני מצהיר/ה בזאת כי למיטב ידיעתי מצב בריאותי תקין ואין לי מגבלה
                רפואית המונעת ממני להשתתף בפעילות. אני מתחייב/ת להודיע באופן 
                מיידי על כל שינוי במצבי הבריאותי.
              </p>
            </div>
            
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Checkbox 
                id="health-agreement" 
                checked={agreed} 
                onCheckedChange={(checked) => setAgreed(checked as boolean)} 
                required
              />
              <label htmlFor="health-agreement" className="mr-2 text-sm font-medium">
                אני מאשר/ת את האמור לעיל
              </label>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="notes" className="block text-sm font-medium">הערות (אופציונלי):</label>
              <Textarea 
                id="notes" 
                placeholder="אנא ציין/י כאן כל מידע רפואי רלוונטי" 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={!agreed || submitting} className="w-full">
              {submitting ? 'שולח...' : 'שלח הצהרה'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default HealthFormPage;
