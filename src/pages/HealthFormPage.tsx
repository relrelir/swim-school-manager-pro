
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Label } from '@/components/ui/label';

const HealthFormPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const declarationId = searchParams.get('id');
  const [isLoading, setIsLoading] = useState(false);
  const [formState, setFormState] = useState({
    agreement: false,
    notes: '',
  });
  const [declaration, setDeclaration] = useState<any>(null);

  // Fetch declaration details
  useEffect(() => {
    const fetchDeclaration = async () => {
      if (!declarationId) return;
      
      try {
        const { data, error } = await supabase
          .from('health_declarations')
          .select('*')
          .eq('id', declarationId)
          .single();
          
        if (error) {
          throw error;
        }
        
        if (data) {
          setDeclaration(data);
          
          // If the form has already been signed, pre-populate with the answers
          if (data.form_status === 'signed' && data.notes) {
            setFormState({
              agreement: true,
              notes: data.notes || '',
            });
          }
        }
      } catch (error) {
        console.error('Error fetching declaration:', error);
      }
    };
    
    fetchDeclaration();
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
      const { error } = await supabase
        .from('health_declarations')
        .update({
          form_status: 'signed',
          signed_at: new Date().toISOString(),
          notes: formState.notes
        })
        .eq('id', declarationId);
      
      if (error) {
        throw new Error(error.message);
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

  // Show error if no declaration ID is provided
  if (!declarationId) {
    return (
      <Card className="w-full max-w-md mx-auto mt-10">
        <CardHeader>
          <CardTitle>שגיאה</CardTitle>
          <CardDescription>מזהה הצהרת בריאות חסר או לא תקין</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Show message if form was already signed
  if (declaration && declaration.form_status === 'signed') {
    return (
      <Card className="w-full max-w-md mx-auto mt-10">
        <CardHeader>
          <CardTitle>הצהרת בריאות</CardTitle>
          <CardDescription>הצהרת הבריאות כבר מולאה ונשלחה בהצלחה!</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button onClick={() => window.close()} className="w-full">סגור</Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>הצהרת בריאות</CardTitle>
          <CardDescription>אנא מלא את הפרטים הבאים והצהר על בריאות המשתתף</CardDescription>
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
