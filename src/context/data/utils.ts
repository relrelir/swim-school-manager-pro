
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';

// Helper function to generate unique IDs
export const generateId = (): string => {
  return uuidv4();
};

// Helper for error handling with toasts
export const handleSupabaseError = (error: any, operation: string): void => {
  console.error(`Error ${operation}:`, error);
  throw new Error(`${operation} failed: ${error.message}`);
};

// Helper to convert database field names to our TypeScript model (camelCase)
export const mapParticipantFromDB = (dbParticipant: any) => {
  return {
    id: dbParticipant.id,
    firstName: dbParticipant.firstname,
    lastName: dbParticipant.lastname,
    idNumber: dbParticipant.idnumber,
    phone: dbParticipant.phone,
    healthApproval: dbParticipant.healthapproval
  };
};

// Helper to convert our TypeScript model to database field names (lowercase)
export const mapParticipantToDB = (participant: any) => {
  return {
    firstname: participant.firstName,
    lastname: participant.lastName,
    idnumber: participant.idNumber,
    phone: participant.phone,
    healthapproval: participant.healthApproval
  };
};

// Helper to convert database field names to our TypeScript model (camelCase) for payments
export const mapPaymentFromDB = (dbPayment: any) => {
  return {
    id: dbPayment.id,
    registrationId: dbPayment.registrationid,
    amount: Number(dbPayment.amount),
    receiptNumber: dbPayment.receiptnumber,
    paymentDate: dbPayment.paymentdate
  };
};

// Helper to convert our TypeScript model to database field names (lowercase) for payments
export const mapPaymentToDB = (payment: any) => {
  return {
    registrationid: payment.registrationId,
    amount: payment.amount,
    receiptnumber: payment.receiptNumber,
    paymentdate: payment.paymentDate
  };
};
