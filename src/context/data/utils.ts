
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

// Helper to convert database field names to our TypeScript model (camelCase) for registrations
export const mapRegistrationFromDB = (dbRegistration: any) => {
  return {
    id: dbRegistration.id,
    productId: dbRegistration.productid,
    participantId: dbRegistration.participantid,
    requiredAmount: Number(dbRegistration.requiredamount),
    paidAmount: Number(dbRegistration.paidamount),
    receiptNumber: dbRegistration.receiptnumber,
    discountApproved: dbRegistration.discountapproved,
    registrationDate: dbRegistration.registrationdate
  };
};

// Helper to convert our TypeScript model to database field names (lowercase) for registrations
export const mapRegistrationToDB = (registration: any) => {
  return {
    productid: registration.productId,
    participantid: registration.participantId,
    requiredamount: registration.requiredAmount,
    paidamount: registration.paidAmount,
    receiptnumber: registration.receiptNumber,
    discountapproved: registration.discountApproved,
    registrationdate: registration.registrationDate
  };
};

// Helper to convert database field names to our TypeScript model (camelCase) for products
export const mapProductFromDB = (dbProduct: any) => {
  return {
    id: dbProduct.id,
    name: dbProduct.name,
    type: dbProduct.description || 'קורס',
    price: Number(dbProduct.price),
    seasonId: dbProduct.seasonid,
    startDate: dbProduct.startdate,
    endDate: dbProduct.enddate,
    maxParticipants: dbProduct.maxparticipants || 20,
    notes: dbProduct.instructor || '',
    startTime: dbProduct.starttime,
    daysOfWeek: dbProduct.daysofweek || []
  };
};

// Helper to convert our TypeScript model to database field names (lowercase) for products
export const mapProductToDB = (product: any) => {
  return {
    name: product.name,
    description: product.type,
    price: product.price,
    seasonid: product.seasonId,
    startdate: product.startDate,
    enddate: product.endDate,
    starttime: product.startTime,
    daysofweek: product.daysOfWeek,
    maxparticipants: product.maxParticipants,
    instructor: product.notes
  };
};

// Helper to convert database field names to our TypeScript model (camelCase) for seasons
export const mapSeasonFromDB = (dbSeason: any) => {
  return {
    id: dbSeason.id,
    name: dbSeason.name,
    startDate: dbSeason.startdate,
    endDate: dbSeason.enddate
  };
};

// Helper to convert our TypeScript model to database field names (lowercase) for seasons
export const mapSeasonToDB = (season: any) => {
  return {
    name: season.name,
    startdate: season.startDate,
    enddate: season.endDate
  };
};
