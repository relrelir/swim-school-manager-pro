
import { PostgrestError } from '@supabase/supabase-js';
import { toast } from "@/components/ui/use-toast";
import { Season, Product, Participant, Registration, Payment } from '@/types';

export const handleSupabaseError = (error: PostgrestError, action: string) => {
  console.error(`Error ${action}:`, error);
  toast({
    title: "שגיאה",
    description: `אירעה שגיאה ב${action}, אנא נסה שנית`,
    variant: "destructive",
  });
};

// Mapping functions for DB conversion
export const mapParticipantFromDB = (dbParticipant: any): Participant => ({
  id: dbParticipant.id,
  firstName: dbParticipant.firstname,
  lastName: dbParticipant.lastname,
  birthDate: dbParticipant.birthdate,
  idNumber: dbParticipant.idnumber,
  gender: dbParticipant.gender,
  phone: dbParticipant.phone,
  email: dbParticipant.email,
  address: dbParticipant.address,
  healthApproval: dbParticipant.healthapproval,
});

export const mapParticipantToDB = (participant: Omit<Participant, 'id'>) => ({
  firstname: participant.firstName,
  lastname: participant.lastName,
  birthdate: participant.birthDate,
  idnumber: participant.idNumber,
  gender: participant.gender,
  phone: participant.phone,
  email: participant.email,
  address: participant.address,
  healthapproval: participant.healthApproval,
});

export const mapProductFromDB = (dbProduct: any): Product => ({
  id: dbProduct.id,
  name: dbProduct.name,
  description: dbProduct.description,
  seasonId: dbProduct.season_id,
  startDate: dbProduct.startdate,
  endDate: dbProduct.enddate,
  dayOfWeek: dbProduct.day_of_week,
  startTime: dbProduct.starttime,
  endTime: dbProduct.endtime,
  price: dbProduct.price,
  maxParticipants: dbProduct.max_participants,
  isActive: dbProduct.is_active,
  teacher: dbProduct.teacher,
});

export const mapProductToDB = (product: Omit<Product, 'id'>) => ({
  name: product.name,
  description: product.description,
  season_id: product.seasonId,
  startdate: product.startDate,
  enddate: product.endDate,
  day_of_week: product.dayOfWeek,
  starttime: product.startTime,
  endtime: product.endTime,
  price: product.price,
  max_participants: product.maxParticipants,
  is_active: product.isActive,
  teacher: product.teacher,
});

export const mapRegistrationFromDB = (dbRegistration: any): Registration => ({
  id: dbRegistration.id,
  productId: dbRegistration.product_id,
  participantId: dbRegistration.participant_id,
  registrationDate: dbRegistration.registration_date,
  requiredAmount: dbRegistration.required_amount,
  discount: dbRegistration.discount,
  totalAmount: dbRegistration.total_amount,
  paidAmount: dbRegistration.paid_amount,
  status: dbRegistration.status,
});

export const mapRegistrationToDB = (registration: Omit<Registration, 'id'>) => ({
  product_id: registration.productId,
  participant_id: registration.participantId,
  registration_date: registration.registrationDate,
  required_amount: registration.requiredAmount,
  discount: registration.discount,
  total_amount: registration.totalAmount,
  paid_amount: registration.paidAmount,
  status: registration.status,
});

export const mapPaymentFromDB = (dbPayment: any): Payment => ({
  id: dbPayment.id,
  registrationId: dbPayment.registration_id,
  amount: dbPayment.amount,
  paymentDate: dbPayment.payment_date,
  paymentMethod: dbPayment.payment_method,
  receiptNumber: dbPayment.receipt_number,
});

export const mapPaymentToDB = (payment: Omit<Payment, 'id'>) => ({
  registration_id: payment.registrationId,
  amount: payment.amount,
  payment_date: payment.paymentDate,
  payment_method: payment.paymentMethod,
  receipt_number: payment.receiptNumber,
});
