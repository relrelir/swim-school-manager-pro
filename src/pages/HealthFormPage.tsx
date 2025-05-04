
import React, { useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import SignatureCanvas from 'react-signature-canvas';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Download, Pen } from 'lucide-react';

const HealthFormPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const declarationId = searchParams.get('id');
  const [isLoading, setIsLoading] = useState(false);
  const [formState, setFormState] = useState({
    agreement: false,
    notes: '',
  });
  const [signatureEmpty, setSignatureEmpty] = useState(true);
  const signatureRef = useRef<SignatureCanvas>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const handleAgreementChange = (checked: boolean) => {
    setFormState({ ...formState, agreement: checked });
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormState({ ...formState, notes: e.target.value });
  };

  const clearSignature = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
      setSignatureEmpty(true);
    }
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

    if (signatureEmpty) {
      toast({
        title: "שגיאה",
        description: "יש לחתום על הצהרת הבריאות",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Get signature as base64 string
      const signatureData = signatureRef.current?.toDataURL();
      
      // Update the health declaration in the database
      const { error } = await supabase
        .from('health_declarations')
        .update({
          form_status: 'signed',
          signed_at: new Date().toISOString(),
          client_answer: JSON.stringify({
            ...formState,
            signatureData
          }),
          notes: formState.notes
        })
        .eq('id', declarationId);
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Navigate to success page with the declaration ID
      navigate(`/form-success?id=${declarationId}`);
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

  const generatePDF = async () => {
    if (!formRef.current) return;
    
    try {
      const canvas = await html2canvas(formRef.current);
      const imgData = canvas.toDataURL('image/png');
      
      // A4 dimensions in mm: 210 x 297
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('הצהרת_בריאות.pdf');
      
      toast({
        title: "PDF נוצר בהצלחה",
        description: "הצהרת הבריאות נשמרה כקובץ PDF",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה ביצירת קובץ PDF",
        variant: "destructive",
      });
    }
  };

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

  return (
    <div className="container mx-auto py-10 px-4">
      <Card className="w-full max-w-md mx-auto">
        <div ref={formRef}>
          <CardHeader className="text-center">
            <CardTitle>הצהרת בריאות</CardTitle>
            <CardDescription>יש למלא את הפרטים הבאים ולחתום על הצהרת הבריאות</CardDescription>
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
              
              <div className="space-y-2">
                <Label htmlFor="signature">חתימה</Label>
                <div className="border rounded-md p-2 bg-white">
                  <SignatureCanvas
                    ref={signatureRef}
                    canvasProps={{ 
                      className: 'w-full h-40',
                      style: { borderBottom: '1px dashed #e2e8f0' }
                    }}
                    onEnd={() => setSignatureEmpty(false)}
                  />
                </div>
                <div className="flex justify-end">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={clearSignature}
                    className="text-xs"
                  >
                    נקה חתימה
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground flex items-center mt-1">
                  <Pen className="h-3 w-3 mr-1" /> 
                  חתום בעזרת העכבר או המסך
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col gap-2">
              <Button type="submit" className="w-full" disabled={isLoading || !formState.agreement || signatureEmpty}>
                {isLoading ? 'שולח...' : 'אישור הצהרה'}
              </Button>
            </CardFooter>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default HealthFormPage;
