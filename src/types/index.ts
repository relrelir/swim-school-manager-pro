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
}

export interface Participant {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  healthApproval: boolean;
}

export interface Registration {
  id: string;
  productId: string;
  participantId: string;
  registrationDate: string;
  requiredAmount: number;
  discountApproved: boolean;
}

export interface Payment {
  id: string;
  registrationId: string;
  paymentDate: string;
  amount: number;
  receiptNumber: string;
}

export interface PaymentStatus {
  paid: number;
  expected: number;
  status: 'paid' | 'partial' | 'unpaid' | 'discounted';
}

// Update the HealthDeclaration interface to match our application model
export interface HealthDeclaration {
  id: string;
  registrationId: string; // This maps to participant_id in the database
  phone: string;
  formStatus: 'pending' | 'signed' | 'expired';
  submissionDate?: string;
  sentAt: string;
  notes?: string;
}
