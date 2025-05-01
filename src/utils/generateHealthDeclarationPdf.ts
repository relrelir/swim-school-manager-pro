
import { supabase } from '@/integrations/supabase/client';
import { createRtlPdf } from './pdf/pdfConfig';
import { buildHealthDeclarationPDF } from './pdf/healthDeclarationContentBuilder';
import { toast } from "@/components/ui/use-toast";

export const generateHealthDeclarationPdf = async (registrationId: string) => {
  try {
    // First, get the health declaration for this registration
    const { data: healthDeclaration, error: healthDeclarationError } = await supabase
      .from('health_declarations')
      .select('id, participant_id, submission_date, notes, form_status')
      .eq('participant_id', registrationId)
      .single();
    
    if (healthDeclarationError || !healthDeclaration) {
      throw new Error('הצהרת בריאות לא נמצאה');
    }
    
    if (healthDeclaration.form_status !== 'signed') {
      throw new Error('הצהרת הבריאות לא מולאה עדיין');
    }
    
    // Get participant details
    const { data: participant, error: participantError } = await supabase
      .from('participants')
      .select('firstname, lastname, idnumber, phone')
      .eq('id', healthDeclaration.participant_id)
      .single();
    
    if (participantError || !participant) {
      throw new Error('פרטי המשתתף לא נמצאו');
    }
    
    console.log("Creating PDF with participant data:", participant);
    
    try {
      // Create the PDF document with RTL and Hebrew font support
      const pdf = createRtlPdf();
      
      // Build the PDF content
      const fileName = buildHealthDeclarationPDF(pdf, healthDeclaration, participant);
      
      // Save the PDF
      pdf.save(fileName);
      
      toast({
        title: "PDF נוצר בהצלחה",
        description: "הצהרת הבריאות נשמרה במכשיר שלך",
      });
      
      return fileName;
    } catch (error) {
      console.error('Error building health declaration PDF:', error);
      throw new Error('אירעה שגיאה ביצירת מסמך ה-PDF');
    }
  } catch (error) {
    console.error('Error generating health declaration PDF:', error);
    toast({
      title: "שגיאה",
      description: error instanceof Error ? error.message : 'אירעה שגיאה ביצירת ה-PDF',
      variant: "destructive",
    });
    throw error;
  }
};
