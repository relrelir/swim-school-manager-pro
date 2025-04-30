
import { HealthDeclaration } from '@/types';

// Map from DB schema (snake_case) to our TypeScript model (camelCase)
export const mapHealthDeclarationFromDB = (dbDeclaration: any): HealthDeclaration => {
  return {
    id: dbDeclaration.id,
    participant_id: dbDeclaration.participant_id,
    phone_sent_to: dbDeclaration.phone_sent_to,
    form_status: dbDeclaration.form_status,
    submission_date: dbDeclaration.submission_date,
    created_at: dbDeclaration.created_at,
    notes: dbDeclaration.notes,
    
    // Map to convenience fields for use in our code
    registrationId: dbDeclaration.participant_id,
    phone: dbDeclaration.phone_sent_to,
    formStatus: dbDeclaration.form_status,
    submissionDate: dbDeclaration.submission_date,
    sentAt: dbDeclaration.created_at
  };
};

// Map from our TypeScript model (camelCase) to DB schema (snake_case)
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
  
  // Handle phone mapping, prioritizing direct field over convenience field
  if (declaration.phone_sent_to !== undefined) {
    result.phone_sent_to = declaration.phone_sent_to;
  } else if (declaration.phone !== undefined) {
    result.phone_sent_to = declaration.phone;
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
