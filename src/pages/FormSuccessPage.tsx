
import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Check, Download } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

const FormSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const declarationId = searchParams.get('id');
  const [formData, setFormData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchDeclarationData = async () => {
      if (!declarationId) return;
      
      try {
        const { data, error } = await supabase
          .from('health_declarations')
          .select('*, participants(*)')
          .eq('id', declarationId)
          .single();
          
        if (error) throw error;
        
        if (data && data.client_answer) {
          const clientData = typeof data.client_answer === 'string' 
            ? JSON.parse(data.client_answer) 
            : data.client_answer;
          
          setFormData({
            ...data,
            participant: data.participants,
            parsedAnswer: clientData
          });
        }
        
      } catch (error) {
        console.error('Error fetching declaration data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDeclarationData();
  }, [declarationId]);

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
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-10 px-4">
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="pt-6">
            <p className="text-center">טוען...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <Card className="w-full max-w-md mx-auto">
        <div ref={formRef}>
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="rounded-full bg-green-100 p-3">
                <Check className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-center">הצהרת הבריאות התקבלה</CardTitle>
            <CardDescription className="text-center">
              תודה על מילוי הצהרת הבריאות
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground text-center">
              הצהרת הבריאות נקלטה במערכת. אין צורך בפעולות נוספות.
            </p>
            
            {formData && (
              <div className="border rounded-md p-4 space-y-4">
                {formData.participant && (
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">פרטי המשתתף:</Label>
                    <p className="text-sm">
                      {formData.participant.firstname} {formData.participant.lastname}
                    </p>
                  </div>
                )}
                
                <div className="space-y-1">
                  <Label className="text-sm font-medium">הצהרת בריאות:</Label>
                  <div className="text-sm p-2 bg-muted rounded">
                    הריני מצהיר/ה כי המשתתף נמצא בכושר ובמצב בריאותי תקין המאפשר השתתפות בפעילות
                  </div>
                </div>
                
                {formData.parsedAnswer?.notes && (
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">הערות:</Label>
                    <p className="text-sm p-2 bg-muted rounded">{formData.parsedAnswer.notes}</p>
                  </div>
                )}
                
                {formData.parsedAnswer?.signatureData && (
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">חתימה:</Label>
                    <div className="border rounded p-2 bg-white">
                      <img 
                        src={formData.parsedAnswer.signatureData} 
                        alt="חתימה" 
                        className="max-h-28 mx-auto"
                      />
                    </div>
                  </div>
                )}
                
                <div className="text-xs text-muted-foreground">
                  תאריך חתימה: {new Date(formData.signed_at).toLocaleDateString('he-IL')}
                </div>
              </div>
            )}
          </CardContent>
        </div>
        
        <div className="p-6 pt-0">
          <Button 
            variant="outline" 
            className="w-full flex items-center justify-center gap-2"
            onClick={generatePDF}
          >
            <Download className="w-4 h-4" />
            הורדת הצהרה כ-PDF
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default FormSuccessPage;
