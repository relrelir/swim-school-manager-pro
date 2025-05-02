
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

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
        .eq('id', healthDeclaration.registration_id)
        .maybeSingle();
        
      if (regError || !registrations) {
        console.error("Registration not found for health declaration:", healthDeclaration.registration_id);
        throw new Error("פרטי הרישום לא נמצאו");
      }
      
      // Now fetch the participant using the registration's participant_id
      const { data: participantFromReg, error: partRegError } = await supabase
        .from('participants')
        .select('*')
        .eq('id', registrations.participant_id)
        .maybeSingle();
        
      if (partRegError || !participantFromReg) {
        console.error("Cannot find participant information:", partRegError);
        throw new Error("פרטי המשתתף לא נמצאו");
      }
      
      // Use the participant data we found
      return {
        participant: {
          fullName: `${participantFromReg.first_name || ''} ${participantFromReg.last_name || ''}`.trim(),
          idNumber: participantFromReg.id_number || '',
          phone: participantFromReg.phone || '',
        },
        parentInfo: {
          parentName: healthDeclaration.parent_name || '',
          parentId: healthDeclaration.parent_id || '',
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
        fullName: `${participant.first_name || ''} ${participant.last_name || ''}`.trim(),
        idNumber: participant.id_number || '',
        phone: participant.phone || '',
      },
      parentInfo: {
        parentName: healthDeclaration.parent_name || '',
        parentId: healthDeclaration.parent_id || '',
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
