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
}

export type PaymentStatus = 'מלא' | 'חלקי' | 'יתר';

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
