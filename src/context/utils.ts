
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
  idNumber: dbParticipant.idnumber,
  phone: dbParticipant.phone,
  healthApproval: dbParticipant.healthapproval,
});

export const mapParticipantToDB = (participant: Omit<Participant, 'id'>) => ({
  firstname: participant.firstName,
  lastname: participant.lastName,
  idnumber: participant.idNumber,
  phone: participant.phone,
  healthapproval: participant.healthApproval,
});

export const mapProductFromDB = (dbProduct: any): Product => ({
  id: dbProduct.id,
  name: dbProduct.name,
  type: dbProduct.description || 'קורס',
  seasonId: dbProduct.season_id,
  startDate: dbProduct.startdate,
  endDate: dbProduct.enddate,
  daysOfWeek: dbProduct.day_of_week,
  startTime: dbProduct.starttime,
  price: dbProduct.price,
  maxParticipants: dbProduct.max_participants,
  notes: dbProduct.teacher,
});

export const mapProductToDB = (product: Omit<Product, 'id'>) => ({
  name: product.name,
  description: product.type,
  season_id: product.seasonId,
  startdate: product.startDate,
  enddate: product.endDate,
  day_of_week: product.daysOfWeek,
  starttime: product.startTime,
  price: product.price,
  max_participants: product.maxParticipants,
  teacher: product.notes,
});

export const mapRegistrationFromDB = (dbRegistration: any): Registration => ({
  id: dbRegistration.id,
  productId: dbRegistration.product_id,
  participantId: dbRegistration.participant_id,
  registrationDate: dbRegistration.registration_date,
  requiredAmount: dbRegistration.required_amount,
  discountAmount: dbRegistration.discount,
  paidAmount: dbRegistration.paid_amount,
  receiptNumber: dbRegistration.receipt_number,
  discountApproved: dbRegistration.discount_approved,
});

export const mapRegistrationToDB = (registration: Omit<Registration, 'id'>) => ({
  product_id: registration.productId,
  participant_id: registration.participantId,
  registration_date: registration.registrationDate,
  required_amount: registration.requiredAmount,
  discount: registration.discountAmount,
  paid_amount: registration.paidAmount,
  receipt_number: registration.receiptNumber,
  discount_approved: registration.discountApproved,
});

export const mapPaymentFromDB = (dbPayment: any): Payment => ({
  id: dbPayment.id,
  registrationId: dbPayment.registration_id,
  amount: dbPayment.amount,
  paymentDate: dbPayment.payment_date,
  receiptNumber: dbPayment.receipt_number,
});

export const mapPaymentToDB = (payment: Omit<Payment, 'id'>) => ({
  registration_id: payment.registrationId,
  amount: payment.amount,
  payment_date: payment.paymentDate,
  receipt_number: payment.receiptNumber,
});

// Helper to calculate current meeting number
export const calculateCurrentMeeting = (product: any): { current: number, total: number } => {
  if (!product.startDate || !product.meetingsCount || !product.daysOfWeek || product.daysOfWeek.length === 0) {
    return { current: 0, total: product.meetingsCount || 10 };
  }

  const startDate = new Date(product.startDate);
  const today = new Date();
  
  // If today is before the start date, return 0
  if (today < startDate) {
    return { current: 0, total: product.meetingsCount };
  }

  // Map Hebrew days to JS day numbers (0 = Sunday, 6 = Saturday)
  const dayMap: { [key: string]: number } = {
    'ראשון': 0,
    'שני': 1,
    'שלישי': 2,
    'רביעי': 3,
    'חמישי': 4,
    'שישי': 5,
    'שבת': 6
  };
  
  // Convert Hebrew days to JS day numbers
  const activityDays = product.daysOfWeek.map((day: string) => dayMap[day]).sort();
  
  let meetingCount = 0;
  let currentDate = new Date(startDate);
  
  // Count meetings until today
  while (currentDate <= today) {
    const dayOfWeek = currentDate.getDay();
    
    if (activityDays.includes(dayOfWeek)) {
      meetingCount++;
      
      // If we've counted all meetings, stop
      if (meetingCount >= product.meetingsCount) {
        break;
      }
    }
    
    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return { 
    current: Math.min(meetingCount, product.meetingsCount), 
    total: product.meetingsCount 
  };
};
