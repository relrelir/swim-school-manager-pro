
import { Season, Product, Registration, Participant, Payment, RegistrationWithDetails, Pool, HealthDeclaration, DailyActivity } from '@/types';

// Create DataContextProps interface for our context values
export interface DataContextProps {
  seasons: Season[];
  products: Product[];
  pools: Pool[];
  participants: Participant[];
  registrations: Registration[];
  payments: Payment[];
  healthDeclarations: HealthDeclaration[];
  addProduct: (product: Omit<Product, 'id'>) => Promise<Product | undefined>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addSeason: (season: Omit<Season, 'id'>) => Promise<Season | undefined>;
  updateSeason: (season: Season) => Promise<void>;
  deleteSeason: (id: string) => Promise<void>;
  addParticipant: (participant: Omit<Participant, 'id'>) => Promise<Participant | undefined>;
  updateParticipant: (participant: Participant) => Promise<void>;
  deleteParticipant: (id: string) => Promise<void>;
  addRegistration: (registration: Omit<Registration, 'id'>) => Promise<Registration | undefined>;
  updateRegistration: (registration: Registration) => Promise<void>;
  deleteRegistration: (id: string) => Promise<void>;
  addPayment: (payment: Omit<Payment, 'id'>) => Promise<Payment | undefined>;
  updatePayment: (payment: Payment) => Promise<void>;
  deletePayment: (id: string) => Promise<void>;
  updateHealthDeclaration: (healthDeclaration: HealthDeclaration) => Promise<void>;
  addHealthDeclaration: (declaration: Omit<HealthDeclaration, 'id'>) => Promise<HealthDeclaration | undefined>;
  getRegistrationsByProduct: (productId: string) => Registration[];
  getRegistrationsByParticipant: (participantId: string) => Registration[];
  getAllRegistrationsWithDetails: () => Promise<RegistrationWithDetails[]>;
  getPaymentsByRegistration: (registrationId: string) => Promise<Payment[]>;
  getProductsBySeason: (seasonId: string) => Product[];
  getProductsByPool: (poolId: string) => Product[];
  getHealthDeclarationByParticipant: (participantId: string) => HealthDeclaration | undefined;
  getHealthDeclarationForRegistration: (registrationId: string) => Promise<HealthDeclaration | undefined>;
  getPoolsBySeason: (seasonId: string) => Pool[];
  getPoolById: (id: string) => Pool | undefined;
  getDailyActivities: (date: string) => DailyActivity[];
  calculateMeetingProgress: (product: Product) => { current: number; total: number };
  addPool: (pool: { name: string; seasonId: string }) => Promise<Pool | null>;
  updatePool: (pool: Pool) => Promise<boolean>;
  deletePool: (id: string) => Promise<boolean>;
  loading: boolean;
}
