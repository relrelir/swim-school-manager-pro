
import { HealthDeclaration } from '@/types';

// Map from DB schema (snake_case) to our TypeScript model (camelCase)
export const mapHealthDeclarationFromDB = (dbDeclaration: any): HealthDeclaration => {
  return {
    id: dbDeclaration.id,
    registrationId: dbDeclaration.participant_id,
    phone: dbDeclaration.phone_sent_to,
    formStatus: dbDeclaration.form_status,
    submissionDate: dbDeclaration.submission_date,
    sentAt: dbDeclaration.created_at,
    notes: dbDeclaration.notes
  };
};

// Map from our TypeScript model (camelCase) to DB schema (snake_case)
export const mapHealthDeclarationToDB = (declaration: Partial<HealthDeclaration>): any => {
  const result: any = {};
  
  if (declaration.id !== undefined) result.id = declaration.id;
  if (declaration.registrationId !== undefined) result.registrationId = declaration.registrationId;
  if (declaration.phone !== undefined) result.phone_sent_to = declaration.phone;
  if (declaration.formStatus !== undefined) result.form_status = declaration.formStatus;
  if (declaration.submissionDate !== undefined) result.submission_date = declaration.submissionDate;
  if (declaration.sentAt !== undefined) result.created_at = declaration.sentAt;
  if (declaration.notes !== undefined) result.notes = declaration.notes;
  
  return result;
};
