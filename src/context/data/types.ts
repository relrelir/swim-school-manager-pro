
import { PaymentStatus, Participant, Payment, Product, Registration, RegistrationWithDetails, Season } from '@/types';

// Context Types for Season
export interface SeasonsContextType {
  seasons: Season[];
  addSeason: (season: Omit<Season, 'id'>) => void;
  updateSeason: (season: Season) => void;
  deleteSeason: (id: string) => void;
  loading: boolean;
}

// Context Types for Product
export interface ProductsContextType {
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  getProductsBySeason: (seasonId: string) => Product[];
  loading: boolean;
}

// Context Types for Participant
export interface ParticipantsContextType {
  participants: Participant[];
  addParticipant: (participant: Omit<Participant, 'id'>) => Promise<Participant | undefined> | void;
  updateParticipant: (participant: Participant) => void;
  deleteParticipant: (id: string) => void;
  loading: boolean;
}

// Context Types for Registration
export interface RegistrationsContextType {
  registrations: Registration[];
  addRegistration: (registration: Omit<Registration, 'id'>) => Promise<Registration | undefined> | void;
  updateRegistration: (registration: Registration) => void;
  deleteRegistration: (id: string) => void;
  getRegistrationsByProduct: (productId: string) => Registration[];
  calculatePaymentStatus: (registration: Registration) => PaymentStatus;
  loading: boolean;
}

// Context Types for Payments
export interface PaymentsContextType {
  payments: Payment[];
  addPayment: (payment: Omit<Payment, 'id'>) => Promise<Payment | undefined> | void;
  updatePayment: (payment: Payment) => void;
  deletePayment: (id: string) => void;
  getPaymentsByRegistration: (registrationId: string) => Payment[];
  loading: boolean;
}

// Context Types for Combined Data
export interface CombinedDataContextType {
  getRegistrationDetails: (productId: string) => RegistrationWithDetails[];
  getAllRegistrationsWithDetails: () => RegistrationWithDetails[];
  getParticipantsByProduct: (productId: string) => Participant[];
  getDailyActivities: (date: string) => any[];
}

// Combined context type
export type DataContextType = SeasonsContextType & 
  ProductsContextType & 
  ParticipantsContextType & 
  RegistrationsContextType & 
  PaymentsContextType &
  CombinedDataContextType;
