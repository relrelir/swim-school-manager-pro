
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
    
    // Try to find registration by health declaration's registration_id if it exists
    let registrationId = healthDeclaration.registration_id;
    
    // If registration_id doesn't exist, try using participant_id as fallback
    if (!registrationId && healthDeclaration.participant_id) {
      registrationId = healthDeclaration.participant_id;
    }

    // Now fetch participant details
    const { data: participant, error: participantError } = await supabase
      .from('participants')
      .select('*')
      .eq('id', healthDeclaration.participant_id)
      .maybeSingle();

    if (participantError || !participant) {
      console.error("Participant not found for health declaration:", healthDeclaration.participant_id);
      
      // Try to find registration by health declaration id as fallback
      const { data: registrations, error: regError } = await supabase
        .from('registrations')
        .select('*')
        .eq('id', registrationId)
        .maybeSingle();
        
      if (regError || !registrations) {
        console.error("Registration not found for health declaration:", registrationId);
        throw new Error("פרטי הרישום לא נמצאו");
      }
      
      // Now fetch the participant using the registration's participantid
      const { data: participantFromReg, error: partRegError } = await supabase
        .from('participants')
        .select('*')
        .eq('id', registrations.participantid)
        .maybeSingle();
        
      if (partRegError || !participantFromReg) {
        console.error("Cannot find participant information:", partRegError);
        throw new Error("פרטי המשתתף לא נמצאו");
      }
      
      // Use the participant data we found
      return {
        participant: {
          fullName: `${participantFromReg.firstname || ''} ${participantFromReg.lastname || ''}`.trim(),
          idNumber: participantFromReg.idnumber || '',
          phone: participantFromReg.phone || '',
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
  } catch (error) {
    console.error("Error fetching health declaration data:", error);
    throw error instanceof Error ? error : new Error("אירעה שגיאה בטעינת נתוני הצהרת הבריאות");
  }
}
