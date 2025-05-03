
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
    
    // Get participant details - using participant_id from the health declaration
    // which in our system could be either a registration ID or actual participant ID
    const { data: participant, error: participantError } = await supabase
      .from('participants')
      .select('firstname, lastname, idnumber, phone')
      .eq('id', healthDeclaration.participant_id)
      .maybeSingle();
    
    // If we didn't find the participant directly by ID, it might be a registration ID
    // Let's try to get the registration and then get the participant
    if (!participant || participantError) {
      console.log("Could not find participant directly. Trying via registration lookup.");
      
      // Try to find the registration using the participant_id (might be a registration ID)
      const { data: registration, error: registrationError } = await supabase
        .from('registrations')
        .select('participantid')
        .eq('id', healthDeclaration.participant_id)
        .maybeSingle();
      
      if (registrationError || !registration) {
        console.error("Registration not found:", registrationError);
        throw new Error('פרטי הרישום לא נמצאו');
      }
      
      // Now get the participant using the participant ID from the registration
      const { data: participantFromReg, error: participantFromRegError } = await supabase
        .from('participants')
        .select('firstname, lastname, idnumber, phone')
        .eq('id', registration.participantid)
        .single();
        
      if (participantFromRegError || !participantFromReg) {
        console.error("Participant details not found from registration:", participantFromRegError);
        throw new Error('פרטי המשתתף לא נמצאו');
      }
      
      console.log("Found participant via registration:", participantFromReg);
      
      // Validate participant data
      if (!participantFromReg.firstname || !participantFromReg.lastname) {
        console.error("Participant name is missing");
      }
      
      try {
        // Create the PDF document with RTL support
        console.log("Creating PDF with RTL support");
        const pdf = await createRtlPdf();
        console.log("PDF object created successfully");
        
        // Build the PDF content
        console.log("Building PDF content");
        const fileName = buildHealthDeclarationPDF(pdf, healthDeclaration, participantFromReg);
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
    } else {
      console.log("Found participant directly:", participant);
      
      // Validate participant data
      if (!participant.firstname || !participant.lastname) {
        console.error("Participant name is missing");
      }
      
      try {
        // Create the PDF document with RTL support
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
