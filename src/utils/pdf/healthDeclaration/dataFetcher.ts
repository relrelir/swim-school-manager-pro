
import { supabase } from '@/integrations/supabase/client';
import { HealthDeclarationType, ParticipantType } from './types';

/**
 * Fetch health declaration data from Supabase
 */
export const fetchHealthDeclarationData = async (
  healthDeclarationId: string
): Promise<{
  healthDeclaration: HealthDeclarationType;
  participant: ParticipantType;
  notes: string | null;
}> => {
  console.log("Fetching health declaration data for ID:", healthDeclarationId);
  
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
  
  console.log("Participant data fetched successfully:", participant);
  
  // Parse the notes if present
  let notes = null;
  if (healthDeclaration.notes) {
    try {
      const parsedNotes = JSON.parse(healthDeclaration.notes);
      notes = parsedNotes.notes || parsedNotes.medicalNotes || null;
    } catch (e) {
      notes = healthDeclaration.notes;
    }
  }
  
  return {
    healthDeclaration,
    participant,
    notes
  };
};
