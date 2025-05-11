
import { HealthDeclaration } from '@/types';

/**
 * Map from DB schema (snake_case) to our TypeScript model (camelCase)
 */
export const mapHealthDeclarationFromDB = (dbDeclaration: any): HealthDeclaration => {
  return {
    id: dbDeclaration.id,
    participant_id: dbDeclaration.participant_id,
    token: dbDeclaration.token,
    form_status: dbDeclaration.form_status,
    submission_date: dbDeclaration.submission_date,
    created_at: dbDeclaration.created_at,
    updated_at: dbDeclaration.updated_at || dbDeclaration.created_at, // Use created_at as fallback
    notes: dbDeclaration.notes,
    signature: dbDeclaration.signature,
    
    // Map to convenience fields for use in our code
    // Consider that participant_id might be either a registration ID or a participant ID
    registrationId: dbDeclaration.participant_id,
    formStatus: dbDeclaration.form_status,
    submissionDate: dbDeclaration.submission_date,
    sentAt: dbDeclaration.created_at
  };
};
