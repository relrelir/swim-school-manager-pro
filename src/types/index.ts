
export interface Season {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
}

export type ProductType = 'קייטנה' | 'חוג' | 'קורס';

export interface Product {
  id: string;
  name: string;
  type: ProductType;
  startDate: string;
  endDate: string;
  price: number;
  maxParticipants: number;
  notes: string;
  seasonId: string;
  meetingsCount?: number;
  daysOfWeek?: string[];
  startTime?: string;
}

export interface Participant {
  id: string;
  firstName: string;
  lastName: string;
  idNumber: string;
  phone: string;
  healthApproval: boolean;
}

export interface Registration {
  id: string;
  productId: string;
  participantId: string;
  requiredAmount: number;
  paidAmount: number;
  receiptNumber: string;
  discountApproved: boolean;
  registrationDate: string;
  discountAmount?: number;
}

export type PaymentStatus = 'מלא' | 'חלקי' | 'הנחה' | 'יתר' | 'מלא / הנחה' | 'חלקי / הנחה';

export interface Payment {
  id: string;
  registrationId: string;
  amount: number;
  receiptNumber: string;
  paymentDate: string;
}

export interface RegistrationWithDetails extends Registration {
  participant: Participant;
  product: Product;
  season: Season;
  paymentStatus: PaymentStatus;
  payments?: Payment[];
}

export interface PaymentDetails {
  amount: number;
  receiptNumber: string;
  paymentDate: string;
}

export interface DailyActivity {
  startTime?: string;
  product: Product;
  numParticipants: number;
  currentMeetingNumber?: number;
  totalMeetings?: number;
}

export type HealthDeclarationStatus = 'pending' | 'sent' | 'signed';

export interface HealthDeclaration {
  id: string;
  registrationId: string;
  phone: string;
  formStatus: HealthDeclarationStatus;
  sentAt: string;
  signedAt?: string;
  clientAnswer?: string;
  notes?: string;
}
