
// Add DataContext type
import { Season, Product, Participant, Registration, Payment } from '@/types';

export interface SeasonsContextType {
  seasons: Season[];
  addSeason: (season: Omit<Season, 'id'>) => Promise<Season | undefined>;
  updateSeason: (season: Season) => void;
  deleteSeason: (id: string) => void;
  loading: boolean;
}

export interface ProductsContextType {
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => Promise<Product | undefined>;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  getProductsBySeason: (seasonId: string) => Product[];
  loading: boolean;
}

export interface ParticipantsContextType {
  participants: Participant[];
  addParticipant: (participant: Omit<Participant, 'id'>) => Promise<Participant | undefined> | void;
  updateParticipant: (participant: Participant) => void;
  deleteParticipant: (id: string) => void;
  loading: boolean;
}

export interface RegistrationsContextType {
  registrations: Registration[];
  addRegistration: (registration: Omit<Registration, 'id'>) => Promise<Registration | undefined>;
  updateRegistration: (registration: Registration) => void;
  deleteRegistration: (id: string) => void;
  getRegistrationsByProduct: (productId: string) => Registration[];
  calculatePaymentStatus: (registration: Registration, payments?: Payment[]) => PaymentStatus;
  getAllRegistrationsWithDetails: () => any[];
  calculateMeetingProgress: (product: Product) => { current: number, total: number };
  loading: boolean;
}

export interface PaymentsContextType {
  payments: Payment[];
  addPayment: (payment: Omit<Payment, 'id'>) => Promise<Payment | undefined>;
  updatePayment: (payment: Payment) => void;
  deletePayment: (id: string) => void;
  getPaymentsByRegistration: (registrationId: string) => Payment[];
  loading: boolean;
}

export interface DailyActivityContextType {
  getDailyActivities: (date: Date) => any[];
}

export interface DataContextType extends 
  SeasonsContextType,
  ProductsContextType,
  ParticipantsContextType,
  RegistrationsContextType,
  PaymentsContextType,
  DailyActivityContextType {}
