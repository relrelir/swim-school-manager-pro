
import { supabase } from '@/integrations/supabase/client';
import { createRtlPdf } from './pdf/pdfConfig';
import { buildHealthDeclarationPDF } from './pdf/healthDeclarationContentBuilder';
import { toast } from "@/components/ui/use-toast";

export const generateHealthDeclarationPdf = async (registrationId: string) => {
  try {
    console.log("Starting health declaration PDF generation for registration ID:", registrationId);
    
    // First, try to get the health declaration with participant_id equal to registrationId
    let { data: healthDeclaration, error: healthDeclarationError } = await supabase
      .from('health_declarations')
      .select('id, participant_id, submission_date, notes, form_status')
      .eq('participant_id', registrationId)
      .single();
    
    // If not found by direct match, we need to find the correct participant ID from the registration
    if (healthDeclarationError || !healthDeclaration) {
      console.log("No direct match found for registration ID:", registrationId);
      console.log("Looking up registration to find participant ID...");
      
      // Get the registration to find the participant ID
      const { data: registration, error: registrationError } = await supabase
        .from('registrations')
        .select('participantid')
        .eq('id', registrationId)
        .single();
      
      if (registrationError || !registration) {
        console.error("Registration not found:", registrationError);
        throw new Error('פרטי הרישום לא נמצאו');
      }
      
      console.log("Found registration with participant ID:", registration.participantid);
      
      // Now look for health declaration with this participant ID
      const { data: participantHealthDeclaration, error: participantHealthDeclarationError } = await supabase
        .from('health_declarations')
        .select('id, participant_id, submission_date, notes, form_status')
        .eq('participant_id', registration.participantid)
        .single();
      
      if (participantHealthDeclarationError || !participantHealthDeclaration) {
        console.error("Health declaration not found for participant:", participantHealthDeclarationError);
        throw new Error('הצהרת בריאות לא נמצאה');
      }
      
      healthDeclaration = participantHealthDeclaration;
    }
    
    // Verify the form is signed
    if (healthDeclaration.form_status !== 'signed') {
      console.error("Health declaration not signed yet");
      throw new Error('הצהרת הבריאות לא מולאה ונחתמה עדיין');
    }
    
    // Get participant details - use participant_id from the health declaration
    const { data: participant, error: participantError } = await supabase
      .from('participants')
      .select('firstname, lastname, idnumber, phone')
      .eq('id', healthDeclaration.participant_id)
      .single();
    
    if (participantError || !participant) {
      console.error("Participant details not found:", participantError);
      throw new Error('פרטי המשתתף לא נמצאו');
    }
    
    console.log("Data fetched successfully. Participant:", participant);
    
    try {
      // Create the PDF document with RTL and font support
      console.log("Creating PDF with RTL support");
      const pdf = createRtlPdf();
      console.log("PDF object created successfully");
      
      // Build the PDF content
      console.log("Building PDF content");
      const fileName = buildHealthDeclarationPDF(pdf, healthDeclaration, participant);
      console.log("PDF content built successfully, filename:", fileName);
      
      // Save the PDF
      pdf.save(fileName);
      console.log("PDF saved successfully");
      
      toast({
        title: "PDF נוצר בהצלחה",
        description: "הצהרת הבריאות נשמרה במכשיר שלך",
      });
      
      return fileName;
    } catch (error) {
      console.error('Error during PDF generation:', error);
      toast({
        variant: "destructive",
        title: "שגיאה ביצירת PDF",
        description: "נא לנסות שוב מאוחר יותר",
      });
      throw new Error('אירעה שגיאה ביצירת מסמך ה-PDF');
    }
  } catch (error) {
    console.error('Error in generateHealthDeclarationPdf:', error);
    toast({
      title: "שגיאה",
      description: error instanceof Error ? error.message : 'אירעה שגיאה ביצירת ה-PDF',
      variant: "destructive",
    });
    throw error;
  }
};
