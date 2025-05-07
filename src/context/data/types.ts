
import { Participant, Product, Registration, Season, Payment, PaymentStatus, HealthDeclaration } from '@/types';

// Import the DailyActivity type or define it here
import { DailyActivity, RegistrationWithDetails } from '@/types';

export interface SeasonsContextType {
  seasons: Season[];
  addSeason: (season: Omit<Season, 'id'>) => Promise<Season | undefined> | undefined;
  updateSeason: (season: Season) => void;
  deleteSeason: (id: string) => void;
  loading: boolean;
}

export interface ProductsContextType {
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => Promise<Product | undefined> | undefined;
  updateProduct: (product: Product) => Promise<void>;
 // deleteProduct: (id: string) => void;
    deleteProduct: (productId: string) => Promise<void>;
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
  addRegistration: (registration: Omit<Registration, 'id'>) => Promise<Registration | undefined> | undefined;
  updateRegistration: (registration: Registration) => void;
  deleteRegistration: (id: string) => void;
  getRegistrationsByProduct: (productId: string) => Registration[];
  calculatePaymentStatus: (registration: Registration) => PaymentStatus;
  loading: boolean;
}

export interface PaymentsContextType {
  payments: Payment[];
  addPayment: (payment: Omit<Payment, 'id'>) => Promise<Payment | undefined> | undefined;
  updatePayment: (payment: Payment) => void;
  deletePayment: (id: string) => void;
  getPaymentsByRegistration: (registrationId: string) => Payment[];
  loading: boolean;
}

export interface HealthDeclarationsContextType {
  healthDeclarations: HealthDeclaration[];
  addHealthDeclaration: (healthDeclaration: Omit<HealthDeclaration, 'id'>) => Promise<HealthDeclaration | undefined>;
  updateHealthDeclaration: (id: string, updates: Partial<HealthDeclaration>) => Promise<HealthDeclaration | undefined>;
  getHealthDeclarationForRegistration: (registrationId: string) => Promise<HealthDeclaration | undefined>;
  deleteHealthDeclaration: (id: string) => Promise<void>;
  createHealthDeclarationLink: (registrationId: string) => Promise<string | undefined>;
  getHealthDeclarationByToken: (token: string) => Promise<HealthDeclaration | undefined>;
  loading: boolean;
}

export interface CombinedDataContextType extends SeasonsContextType, ProductsContextType, ParticipantsContextType, RegistrationsContextType, PaymentsContextType, HealthDeclarationsContextType {
  getAllRegistrationsWithDetails: () => RegistrationWithDetails[];
  calculateMeetingProgress: (product: Product) => { current: number; total: number };
  getDailyActivities: (date: string) => DailyActivity[];
}
