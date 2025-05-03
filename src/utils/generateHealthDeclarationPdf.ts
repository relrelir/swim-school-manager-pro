
import { supabase } from '@/integrations/supabase/client';
import { createRtlPdf } from './pdf/pdfConfig';
import { buildHealthDeclarationPDF } from './pdf/healthDeclarationContentBuilder';
import { toast } from "@/components/ui/use-toast";

export const generateHealthDeclarationPdf = async (healthDeclarationId: string) => {
  try {
    console.log("Starting health declaration PDF generation for declaration ID:", healthDeclarationId);
    
    if (!healthDeclarationId) {
      console.error("Health declaration ID is missing or invalid");
      throw new Error('מזהה הצהרת הבריאות חסר או לא תקין');
    }
    
    // Get the health declaration directly by ID
    let { data: healthDeclaration, error: healthDeclarationError } = await supabase
      .from('health_declarations')
      .select('id, participant_id, submission_date, notes, form_status')
      .eq('id', healthDeclarationId)
      .single();
    
    if (healthDeclarationError || !healthDeclaration) {
      console.error("Health declaration not found by ID:", healthDeclarationError, healthDeclarationId);
      throw new Error('הצהרת בריאות לא נמצאה');
    }
    
    console.log("Found health declaration:", healthDeclaration);
    
    // Get participant details using the participant_id field from the health declaration
    // This field should contain the participant's ID, not the registration ID
    const { data: participant, error: participantError } = await supabase
      .from('participants')
      .select('firstname, lastname, idnumber, phone')
      .eq('id', healthDeclaration.participant_id)
      .single();
    
    if (participantError || !participant) {
      console.error("Participant details not found:", participantError);
      
      // Let's try to find the participant through registrations as a fallback
      // This handles cases where participant_id might actually contain a registration ID
      const { data: registration, error: registrationError } = await supabase
        .from('registrations')
        .select('participantid')
        .eq('id', healthDeclaration.participant_id)
        .single();
      
      if (registrationError || !registration) {
        console.error("Registration not found for fallback:", registrationError);
        throw new Error('פרטי המשתתף לא נמצאו');
      }
      
      const { data: fallbackParticipant, error: fallbackError } = await supabase
        .from('participants')
        .select('firstname, lastname, idnumber, phone')
        .eq('id', registration.participantid)
        .single();
        
      if (fallbackError || !fallbackParticipant) {
        console.error("Fallback participant details not found:", fallbackError);
        throw new Error('פרטי המשתתף לא נמצאו גם בחיפוש חלופי');
      }
      
      console.log("Found participant through fallback method:", fallbackParticipant);
      
      // Use the participant data found through the fallback
      try {
        // Create the PDF document with RTL and font support - now async
        console.log("Creating PDF with RTL support");
        const pdf = await createRtlPdf();
        console.log("PDF object created successfully");
        
        // Build the PDF content with the fallback participant data
        console.log("Building PDF content");
        const fileName = buildHealthDeclarationPDF(pdf, healthDeclaration, fallbackParticipant);
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
        console.error('Error during PDF generation with fallback data:', error);
        throw error;
      }
    }
    
    console.log("Data fetched successfully. Participant:", participant);
    
    try {
      // Create the PDF document with RTL and font support - now async
      console.log("Creating PDF with RTL support");
      const pdf = await createRtlPdf();
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
