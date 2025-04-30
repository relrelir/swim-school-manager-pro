
import { HealthDeclaration, HealthDeclarationStatus } from '@/types';

// Helper to map from DB column names to our TypeScript model
export const mapHealthDeclarationFromDB = (dbDeclaration: any): HealthDeclaration => {
  return {
    id: dbDeclaration.id,
    registrationId: dbDeclaration.registration_id,
    phone: dbDeclaration.phone || '',
    formStatus: dbDeclaration.form_status as HealthDeclarationStatus,
    sentAt: dbDeclaration.sent_at || '',
    signedAt: dbDeclaration.signed_at,
    clientAnswer: dbDeclaration.client_answer,
    notes: dbDeclaration.notes
  };
};

// Helper to map from our TypeScript model to DB column names
export const mapHealthDeclarationToDB = (declaration: Partial<HealthDeclaration>): any => {
  const result: any = {};
  
  if (declaration.registrationId !== undefined) result.registration_id = declaration.registrationId;
  if (declaration.phone !== undefined) result.phone = declaration.phone;
  if (declaration.formStatus !== undefined) result.form_status = declaration.formStatus;
  if (declaration.sentAt !== undefined) result.sent_at = declaration.sentAt;
  if (declaration.signedAt !== undefined) result.signed_at = declaration.signedAt;
  if (declaration.clientAnswer !== undefined) result.client_answer = declaration.clientAnswer;
  if (declaration.notes !== undefined) result.notes = declaration.notes;
  
  return result;
};
