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

export type PaymentStatus = 'paid' | 'partial' | 'unpaid' | 'discounted' | 'מלא' | 'חלקי' | 'יתר' | 'הנחה' | 'מלא / הנחה' | 'חלקי / הנחה';

export interface PaymentStatusDetails {
  paid: number;
  expected: number;
  status: PaymentStatus;
}

export interface HealthDeclaration {
  id: string;
  participant_id: string; // This is the field name in the database (stores registration ID)
  token: string;
  form_status: 'pending' | 'signed' | 'expired' | 'completed';
  submission_date?: string;
  created_at: string;
  notes?: string;
  signature?: string; // Added signature field
  
  // These fields are used in our TypeScript code but mapped differently when sending to the database
  registrationId?: string; // For convenience in our code
  formStatus?: 'pending' | 'signed' | 'expired' | 'completed'; // For convenience in our code
  submissionDate?: string; // For convenience in our code
  sentAt?: string; // For convenience in our code
}

// Add missing types needed by other components
export interface RegistrationWithDetails extends Registration {
  participant: Participant;
  product: Product;
  season: Season;
  payments?: Payment[];
  paymentStatus: PaymentStatus;
}

export interface PaymentDetails {
  id: string;
  registrationId: string;
  amount: number;
  receiptNumber: string;
  createdAt: string;
}

export interface DailyActivity {
  product: Product;
  startTime: string;
  numParticipants: number;
  currentMeetingNumber: number;
  totalMeetings: number;
}
