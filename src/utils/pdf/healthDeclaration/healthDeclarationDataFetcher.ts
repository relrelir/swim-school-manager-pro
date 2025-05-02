
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { parseParentInfo } from '../../healthDeclarationParser';

export interface HealthDeclarationPdfData {
  participant: {
    fullName: string;
    idNumber: string;
    phone: string;
  };
  parentInfo: {
    parentName: string;
    parentId: string;
  };
  declaration: {
    submissionDate: string;
  };
  medicalNotes: string;
}

/**
 * Fetches data needed for health declaration PDF
 */
export async function fetchHealthDeclarationData(declarationId: string): Promise<HealthDeclarationPdfData> {
  console.log("Fetching health declaration data for ID:", declarationId);

  if (!declarationId) {
    throw new Error("HealthDeclarationIdMissing");
  }

  try {
    // Fetch health declaration
    const { data: healthDeclaration, error: healthError } = await supabase
      .from('health_declarations')
      .select('*')
      .eq('id', declarationId)
      .maybeSingle();

    if (healthError) {
      console.error("Error fetching health declaration:", healthError);
      throw new Error("הצהרת בריאות לא נמצאה");
    }

    if (!healthDeclaration) {
      console.error("Health declaration not found:", declarationId);
      throw new Error("הצהרת בריאות לא נמצאה");
    }

    console.log("Found health declaration:", healthDeclaration);

    // Extract parent info from notes
    const { parentName, parentId } = parseParentInfo(healthDeclaration.notes);
    
    // First try to find registration directly by participant_id
    // Note: participant_id in health_declarations sometimes refers to registration ID
    const registrationId = healthDeclaration.participant_id;
    
    // Now fetch participant details - try two approaches to be safe
    
    // First, try to find registration and participant through querying registrations table
    const { data: registration, error: regError } = await supabase
      .from('registrations')
      .select('*')
      .eq('id', registrationId)
      .maybeSingle();
    
    // If found the registration, use it to get the participant
    if (registration && !regError) {
      console.log("Found registration via direct ID match:", registration);
      
      const { data: participant, error: partError } = await supabase
        .from('participants')
        .select('*')
        .eq('id', registration.participantid)
        .maybeSingle();
      
      if (partError || !participant) {
        console.error("Error finding participant via registration:", partError);
        throw new Error("פרטי המשתתף לא נמצאו");
      }
      
      console.log("Found participant via registration:", participant);
      
      // Format the data for PDF generation
      return {
        participant: {
          fullName: `${participant.firstname || ''} ${participant.lastname || ''}`.trim(),
          idNumber: participant.idnumber || '',
          phone: participant.phone || '',
        },
        parentInfo: {
          parentName: parentName || '',
          parentId: parentId || '',
        },
        declaration: {
          submissionDate: format(new Date(healthDeclaration.submission_date), 'dd/MM/yyyy'),
        },
        medicalNotes: healthDeclaration.notes || '',
      };
    }
    
    // Second approach: Try to find participant directly
    const { data: directParticipant, error: directPartError } = await supabase
      .from('participants')
      .select('*')
      .eq('id', healthDeclaration.participant_id)
      .maybeSingle();
    
    if (directPartError || !directParticipant) {
      console.error("Participant not found directly or via registration:", healthDeclaration.participant_id);
      throw new Error("פרטי המשתתף לא נמצאו");
    }
    
    console.log("Found participant directly:", directParticipant);
    
    // Format the data for PDF generation using directly found participant
    return {
      participant: {
        fullName: `${directParticipant.firstname || ''} ${directParticipant.lastname || ''}`.trim(),
        idNumber: directParticipant.idnumber || '',
        phone: directParticipant.phone || '',
      },
      parentInfo: {
        parentName: parentName || '',
        parentId: parentId || '',
      },
      declaration: {
        submissionDate: format(new Date(healthDeclaration.submission_date), 'dd/MM/yyyy'),
      },
      medicalNotes: healthDeclaration.notes || '',
    };
  } catch (error) {
    console.error("Error fetching health declaration data:", error);
    throw error instanceof Error ? error : new Error("אירעה שגיאה בטעינת נתוני הצהרת הבריאות");
  }
}
