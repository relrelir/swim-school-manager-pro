import { Product } from "@/types";

export const handleSupabaseError = (error: any, operation: string) => {
  console.error(`Error ${operation}:`, error);
};

// Calculate current meeting based on a product's schedule
export const calculateCurrentMeeting = (product: Product) => {
  const startDate = new Date(product.startDate);
  const today = new Date();
  
  if (today < startDate) return { current: 0, total: product.meetingsCount || 10 };
  
  const daysInWeekForProduct = product.daysOfWeek?.length || 1;
  const daysDiff = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Calculate how many meeting days based on days difference and meeting frequency
  const weeksPassed = Math.floor(daysDiff / 7);
  const meetingsPassed = (weeksPassed * daysInWeekForProduct) + 1; // +1 for the first meeting
  
  // Make sure we don't exceed total meetings
  const currentMeeting = Math.min(meetingsPassed, product.meetingsCount || 10);
  
  return {
    current: currentMeeting,
    total: product.meetingsCount || 10
  };
};

export const mapProductFromDB = (dbProduct: any): Product => {
  return {
    id: dbProduct.id,
    name: dbProduct.name,
    description: dbProduct.description,
    price: dbProduct.price,
    imageUrl: dbProduct.imageUrl,
    active: dbProduct.active,
    startDate: dbProduct.startdate,
    endDate: dbProduct.enddate,
    maxParticipants: dbProduct.maxparticipants,
    notes: dbProduct.notes,
    seasonId: dbProduct.seasonid,
    type: dbProduct.type || 'קורס', // Provide a default value if type is missing
    meetingsCount: dbProduct.meetingscount,
    startTime: dbProduct.starttime,
    daysOfWeek: dbProduct.daysofweek,
    discountAmount: dbProduct.discountAmount,
    effectivePrice: dbProduct.effectivePrice,
    poolId: dbProduct.poolid
  };
};

export const mapProductToDB = (product: any) => {
  return {
    name: product.name,
    description: product.description,
    price: product.price,
    seasonid: product.seasonId,
    startdate: product.startDate,
    enddate: product.endDate,
    starttime: product.startTime,
    daysofweek: product.daysOfWeek,
    maxparticipants: product.maxParticipants,
    instructor: product.instructor,
    meetingscount: product.meetingsCount,
    poolid: product.poolId,
    type: product.type // Add the type field to the database mapping
  };
};

// Mapping functions for Participant objects
export const mapParticipantFromDB = (dbParticipant: any) => {
  return {
    id: dbParticipant.id,
    firstName: dbParticipant.firstname,
    lastName: dbParticipant.lastname,
    phone: dbParticipant.phone,
    healthApproval: dbParticipant.healthapproval,
    idNumber: dbParticipant.idnumber
  };
};

export const mapParticipantToDB = (participant: any) => {
  return {
    firstname: participant.firstName,
    lastname: participant.lastName,
    phone: participant.phone,
    healthapproval: participant.healthApproval,
    idnumber: participant.idNumber
  };
};

// Mapping functions for Registration objects
export const mapRegistrationFromDB = (dbRegistration: any) => {
  return {
    id: dbRegistration.id,
    productId: dbRegistration.productid,
    participantId: dbRegistration.participantid,
    registrationDate: dbRegistration.registrationdate,
    requiredAmount: dbRegistration.requiredamount,
    paidAmount: dbRegistration.paidamount,
    discountApproved: dbRegistration.discountapproved,
    discountAmount: dbRegistration.discountamount,
    receiptNumber: dbRegistration.receiptnumber
  };
};

export const mapRegistrationToDB = (registration: any) => {
  return {
    productid: registration.productId,
    participantid: registration.participantId,
    registrationdate: registration.registrationDate,
    requiredamount: registration.requiredAmount,
    paidAmount: registration.paidAmount,
    discountapproved: registration.discountApproved,
    discountamount: registration.discountAmount,
    receiptnumber: registration.receiptNumber
  };
};

// Mapping functions for Payment objects
export const mapPaymentFromDB = (dbPayment: any) => {
  return {
    id: dbPayment.id,
    registrationId: dbPayment.registrationid,
    paymentDate: dbPayment.paymentdate,
    amount: dbPayment.amount,
    receiptNumber: dbPayment.receiptnumber
  };
};

export const mapPaymentToDB = (payment: any) => {
  return {
    registrationid: payment.registrationId,
    paymentdate: payment.paymentDate,
    amount: payment.amount,
    receiptnumber: payment.receiptNumber
  };
};
