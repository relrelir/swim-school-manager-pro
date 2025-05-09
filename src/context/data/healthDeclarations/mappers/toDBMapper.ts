
import { HealthDeclaration } from '@/types';

/**
 * Map from our TypeScript model (camelCase) to DB schema (snake_case)
 */
export const mapHealthDeclarationToDB = (declaration: Partial<HealthDeclaration>): any => {
  const result: any = {};
  
  // Transfer id field directly if it exists
  if (declaration.id !== undefined) result.id = declaration.id;
  
  // CRITICAL: participant_id in the DB is actually registrationId in our app
  // Always ensure participant_id is properly set from either source
  if (declaration.participant_id !== undefined) {
    result.participant_id = declaration.participant_id;
  } else if (declaration.registrationId !== undefined) {
    result.participant_id = declaration.registrationId;
  }
  
  // Handle token field
  if (declaration.token !== undefined) {
    result.token = declaration.token;
  }
  
  // Handle form status mapping, prioritizing direct field over convenience field
  if (declaration.form_status !== undefined) {
    result.form_status = declaration.form_status;
  } else if (declaration.formStatus !== undefined) {
    result.form_status = declaration.formStatus;
  }
  
  // Handle date fields, prioritizing direct fields over convenience fields
  if (declaration.submission_date !== undefined) {
    result.submission_date = declaration.submission_date;
  } else if (declaration.submissionDate !== undefined) {
    result.submission_date = declaration.submissionDate;
  }
  
  if (declaration.created_at !== undefined) {
    result.created_at = declaration.created_at;
  } else if (declaration.sentAt !== undefined) {
    result.created_at = declaration.sentAt;
  }
  
  // Handle notes field directly
  if (declaration.notes !== undefined) result.notes = declaration.notes;
  
  return result;
};
