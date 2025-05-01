
import { supabase } from '@/integrations/supabase/client';
import { createPdf } from './pdf/pdfHelpers';
import { buildHealthDeclarationPDF } from './pdf/healthDeclarationContentBuilder';

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
    
    // Create the PDF document
    const pdf = createPdf();
    
    // Build the PDF content
    const fileName = buildHealthDeclarationPDF(pdf, healthDeclaration, participant);
    
    // Save the PDF
    pdf.save(fileName);
    
    return fileName;
  } catch (error) {
    console.error('Error generating health declaration PDF:', error);
    throw error;
  }
};
