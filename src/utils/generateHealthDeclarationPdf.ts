
import { supabase } from '@/integrations/supabase/client';
import { createRtlPdf } from './pdf/pdfConfig';
import { buildHealthDeclarationPDF } from './pdf/healthDeclarationContentBuilder';
import { toast } from "@/components/ui/use-toast";

export const generateHealthDeclarationPdf = async (participantId: string) => {
  try {
    console.log("Starting health declaration PDF generation for participant ID:", participantId);
    
    if (!participantId) {
      console.error("Participant ID is missing or invalid");
      throw new Error('מזהה המשתתף חסר או לא תקין');
    }
    
    // 1. Get the registration using participant ID
    const { data: registration, error: registrationError } = await supabase
      .from('registrations')
      .select('*')
      .eq('participantid', participantId)
      .single();
      
    if (registrationError || !registration) {
      console.error("Registration details not found:", registrationError);
      throw new Error('פרטי הרישום לא נמצאו');
    }
    
    console.log("Found registration:", registration);
    
    // 2. Get participant details using the participantId
    const { data: participant, error: participantError } = await supabase
      .from('participants')
      .select('firstname, lastname, idnumber, phone')
      .eq('id', participantId)
      .single();
    
    if (participantError || !participant) {
      console.error("Participant details not found:", participantError);
      throw new Error('פרטי המשתתף לא נמצאו');
    }

    if (!participant.firstname || !participant.lastname) {
  throw new Error("חסר שם פרטי או שם משפחה למשתתף");
}

const fullName = `${participant.firstname} ${participant.lastname}`.trim();

    
    console.log("Data fetched successfully. Participant:", participant);
    
    // 3. Get health declaration data (if exists) - now including signature field
    let { data: healthDeclaration, error: healthDeclarationError } = await supabase
      .from('health_declarations')
    .select('id, participant_id, submission_date, notes, form_status, signature, parent_name, parent_id')

      .eq('participant_id', participantId)
      .single();
    
    // If no health declaration exists, create a default object for PDF generation
    if (healthDeclarationError || !healthDeclaration) {
      healthDeclaration = {
        id: '',
        participant_id: participantId,
        submission_date: null,
        notes: null,
        form_status: 'pending',
        signature: null
      };
      console.log("No health declaration found, using default object");
    } else {
      console.log("Found health declaration:", healthDeclaration.id);
    }
    
    try {
      // Create the PDF document with RTL and font support
      console.log("Creating PDF with RTL support");
      const pdf = await createRtlPdf();
      console.log("PDF object created successfully");
      
      // Build the PDF content with improved layout
      console.log("Building PDF content");
     const fileName = buildHealthDeclarationPDF(pdf, healthDeclaration, {
  ...participant,
  fullName,
});

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
