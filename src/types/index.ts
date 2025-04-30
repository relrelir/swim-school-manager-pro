
export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'admin' | 'user';
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  active: boolean;
  startDate: string;
  endDate: string;
  maxParticipants: number;
  notes?: string;
  seasonId: string;
  type: ProductType;
  meetingsCount?: number;
  startTime?: string;
  daysOfWeek?: string[];
  discountAmount?: number;
  effectivePrice?: number;
}

export type ProductType = 'קורס' | 'חוג' | 'קייטנה';

export interface Season {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
}

export interface Participant {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  healthApproval: boolean;
  idNumber: string;
}

export interface Registration {
  id: string;
  productId: string;
  participantId: string;
  registrationDate: string;
  requiredAmount: number;
  paidAmount: number;
  discountApproved: boolean;
  discountAmount?: number;
  receiptNumber: string;
}

export interface Payment {
  id: string;
  registrationId: string;
  paymentDate: string;
  amount: number;
  receiptNumber: string;
}

export type PaymentStatus = 'paid' | 'partial' | 'unpaid' | 'discounted';

export interface PaymentStatusDetails {
  paid: number;
  expected: number;
  status: PaymentStatus;
}

// Update the HealthDeclaration interface to match our database structure
export interface HealthDeclaration {
  id: string;
  participant_id: string; // This is the field name in the database (stores registration ID)
  phone_sent_to: string;
  form_status: 'pending' | 'signed' | 'expired';
  submission_date?: string;
  created_at: string;
  notes?: string;
  
  // These fields are used in our TypeScript code but mapped differently when sending to the database
  registrationId?: string; // For convenience in our code
  phone?: string; // For convenience in our code
  formStatus?: 'pending' | 'signed' | 'expired'; // For convenience in our code
  submissionDate?: string; // For convenience in our code
  sentAt?: string; // For convenience in our code
}
