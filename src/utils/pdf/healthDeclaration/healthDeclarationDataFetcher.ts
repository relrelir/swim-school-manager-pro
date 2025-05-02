
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { parseParentInfo, parseMedicalNotes } from '../../pdf/healthDeclarationParser';

export interface HealthDeclarationPdfData {
  declaration: {
    id: string;
    submissionDate: string;
    formStatus: string;
    notes: string;
  };
  participant: {
    fullName: string;
    idNumber: string;
    phone: string;
  };
  parentInfo: {
    parentName: string;
    parentId: string;
  };
  medicalNotes: string;
}

/**
 * Fetches all data needed for health declaration PDF
 */
export const fetchHealthDeclarationData = async (healthDeclarationId: string): Promise<HealthDeclarationPdfData> => {
  console.log("Fetching health declaration data for ID:", healthDeclarationId);
  
  if (!healthDeclarationId) {
    console.error("Health declaration ID is missing or invalid");
    throw new Error('מזהה הצהרת הבריאות חסר או לא תקין');
  }
  
  // Get the health declaration by ID
  const { data: healthDeclaration, error: healthDeclarationError } = await supabase
    .from('health_declarations')
    .select('id, participant_id, submission_date, notes, form_status')
    .eq('id', healthDeclarationId)
    .maybeSingle();
  
  if (healthDeclarationError) {
    console.error("Error fetching health declaration:", healthDeclarationError);
    throw new Error('שגיאה בטעינת הצהרת הבריאות');
  }
  
  if (!healthDeclaration) {
    console.error("Health declaration not found by ID:", healthDeclarationId);
    throw new Error('הצהרת בריאות לא נמצאה');
  }
  
  console.log("Found health declaration:", healthDeclaration);
  
  try {
    // In our system, participant_id in health declarations actually contains the registration ID
    // We need to get the registration to find the correct participant
    const { data: registration, error: registrationError } = await supabase
      .from('registrations')
      .select('*')
      .eq('id', healthDeclaration.participant_id)
      .maybeSingle();
    
    if (registrationError) {
      console.error("Registration fetch error:", registrationError);
      throw new Error('שגיאה בטעינת פרטי הרישום');
    }
    
    if (!registration) {
      console.error("Registration not found for health declaration:", healthDeclaration.participant_id);
      // Try a different approach - maybe the participant_id is actually the participant's ID
      const { data: registrationByParticipant, error: regByParticipantError } = await supabase
        .from('registrations')
        .select('*')
        .eq('participantid', healthDeclaration.participant_id)
        .maybeSingle();
      
      if (regByParticipantError || !registrationByParticipant) {
        // Still not found - throw the original error
        console.error("Could not find registration with either match method");
        throw new Error('פרטי הרישום לא נמצאו');
      }
      
      // Found by participant ID directly
      console.log("Found registration using participant ID:", registrationByParticipant);
      
      // Get the participant using the participantId from the registration
      const { data: participant, error: participantError } = await supabase
        .from('participants')
        .select('*')
        .eq('id', registrationByParticipant.participantid)
        .maybeSingle();
      
      if (participantError || !participant) {
        console.error("Participant not found:", participantError || "No data");
        throw new Error('פרטי המשתתף לא נמצאו');
      }
      
      // Parse parent information and medical notes from the health declaration notes
      const parentInfo = parseParentInfo(healthDeclaration.notes);
      const medicalNotes = parseMedicalNotes(healthDeclaration.notes);
      
      // Format the date
      const formattedDate = healthDeclaration.submission_date 
        ? format(new Date(healthDeclaration.submission_date), 'dd/MM/yyyy HH:mm') 
        : format(new Date(), 'dd/MM/yyyy HH:mm');
      
      // Return formatted data for PDF generation
      return {
        declaration: {
          id: healthDeclaration.id,
          submissionDate: formattedDate,
          formStatus: healthDeclaration.form_status,
          notes: healthDeclaration.notes || '',
        },
        participant: {
          fullName: `${participant.firstname} ${participant.lastname}`,
          idNumber: participant.idnumber,
          phone: participant.phone,
        },
        parentInfo,
        medicalNotes,
      };
    }
    
    // Get the participant using the participantId from the registration
    const { data: participant, error: participantError } = await supabase
      .from('participants')
      .select('*')
      .eq('id', registration.participantid)
      .maybeSingle();
    
    if (participantError) {
      console.error("Participant fetch error:", participantError);
      throw new Error('שגיאה בטעינת פרטי המשתתף');
    }
    
    if (!participant) {
      console.error("Participant not found for registration:", registration.participantid);
      throw new Error('פרטי המשתתף לא נמצאו');
    }
    
    // Parse parent information and medical notes from the health declaration notes
    const parentInfo = parseParentInfo(healthDeclaration.notes);
    const medicalNotes = parseMedicalNotes(healthDeclaration.notes);
    
    // Format the date
    const formattedDate = healthDeclaration.submission_date 
      ? format(new Date(healthDeclaration.submission_date), 'dd/MM/yyyy HH:mm') 
      : format(new Date(), 'dd/MM/yyyy HH:mm');
    
    // Return formatted data for PDF generation
    return {
      declaration: {
        id: healthDeclaration.id,
        submissionDate: formattedDate,
        formStatus: healthDeclaration.form_status,
        notes: healthDeclaration.notes || '',
      },
      participant: {
        fullName: `${participant.firstname} ${participant.lastname}`,
        idNumber: participant.idnumber,
        phone: participant.phone,
      },
      parentInfo,
      medicalNotes,
    };
  } catch (error) {
    console.error("Error processing health declaration data:", error);
    if (error instanceof Error) {
      throw error; // Re-throw if it's already an Error object with proper message
    }
    throw new Error('שגיאה בעיבוד נתוני הצהרת הבריאות');
  }
};
