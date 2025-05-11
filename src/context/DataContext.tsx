
import React, { createContext, useContext } from 'react';
import { Season, Product, Registration, Participant, Payment, RegistrationWithDetails, Pool, HealthDeclaration, DailyActivity } from '@/types';
import { SeasonsProvider } from './data/SeasonsProvider';
import { ProductsProvider } from './data/ProductsProvider';
import { ParticipantsProvider } from './data/ParticipantsProvider';
import { RegistrationsProvider } from './data/RegistrationsProvider';
import { PaymentsProvider } from './data/PaymentsProvider';
import { HealthDeclarationsProvider } from './data/HealthDeclarationsProvider';
import { PoolsProvider } from './data/PoolsProvider';
import { useSeasons } from '@/hooks/useSeasons';
import { useProducts } from '@/hooks/useProducts';
import { useParticipants } from '@/hooks/useParticipants';
import { useRegistrations } from '@/hooks/useRegistrations';
import { usePayments } from '@/hooks/usePayments';
import { useHealthDeclarations } from '@/hooks/useHealthDeclarations';
import { usePoolsContext } from './data/pools/usePoolsContext';
import { calculatePaymentStatus } from '@/utils/paymentUtils';
import { format } from 'date-fns';
import { Day } from 'date-fns';

// Create a stub for the hebrew locale to avoid the type error
const heLocale = { 
  code: 'he',
  formatLong: {},
  formatRelative: () => '',
  localize: {
    ordinalNumber: () => '',
    era: () => '',
    quarter: () => '',
    month: () => '',
    day: () => '',
    dayPeriod: () => ''
  },
  match: {
    ordinalNumber: () => 0,
    era: () => 0,
    quarter: () => 0,
    month: () => 0,
    day: () => 0,
    dayPeriod: () => 0
  },
  options: {
    weekStartsOn: 0 as Day,
    firstWeekContainsDate: 1
  }
};

interface DataContextProps {
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
  getAllRegistrationsWithDetails: () => RegistrationWithDetails[];
  getPaymentsByRegistration: (registrationId: string) => Payment[];
  getProductsBySeason: (seasonId: string) => Product[];
  getProductsByPool: (poolId: string) => Product[];
  getHealthDeclarationByParticipant: (participantId: string) => HealthDeclaration | undefined;
  getPoolsBySeason: (seasonId: string) => Pool[];
  getPoolById: (id: string) => Pool | undefined;
  getDailyActivities: (date: string) => DailyActivity[];
  calculateMeetingProgress: (product: Product) => { current: number; total: number };
  addPool: (pool: { name: string; seasonId: string }) => Promise<Pool | null>;
  updatePool: (pool: Pool) => Promise<boolean>;
  deletePool: (id: string) => Promise<boolean>;
  loading: boolean;
}

const DataContext = createContext<DataContextProps | null>(null);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const { seasons, addSeason, updateSeason, deleteSeason: deleteSeasonContext, loading: seasonsLoading } = useSeasons();
  
  // Explicitly define the type for useProducts
  const productsContext = useProducts();
  const { 
    products, 
    addProduct, 
    updateProduct, 
    deleteProduct, 
    getProductsBySeason, 
    getProductsByPool, // Now correctly typed
    loading: productsLoading 
  } = productsContext;
  
  // Explicitly define the type for useParticipants
  const participantsContext = useParticipants();
  const { 
    participants, 
    addParticipant, 
    updateParticipant, 
    deleteParticipant, 
    loading: participantsLoading 
  } = participantsContext;
  
  const { registrations, addRegistration, updateRegistration, deleteRegistration, getRegistrationsByProduct, calculatePaymentStatus: calcRegPaymentStatus, loading: registrationsLoading } = useRegistrations();
  const { payments, addPayment, updatePayment, deletePayment, getPaymentsByRegistration, loading: paymentsLoading } = usePayments();
  
  // Explicitly define the type for useHealthDeclarations
  const healthContext = useHealthDeclarations();
  const { 
    healthDeclarations, 
    updateHealthDeclaration, 
    addHealthDeclaration, 
    loading: healthDeclarationsLoading 
  } = healthContext;
  
  const { pools, getPoolsBySeason, addPool, updatePool, deletePool, loading: poolsLoading } = usePoolsContext();
  const loading = seasonsLoading || productsLoading || participantsLoading || registrationsLoading || paymentsLoading || healthDeclarationsLoading || poolsLoading;

  // Get registrations by participant
  const getRegistrationsByParticipant = (participantId: string) => {
    return registrations.filter(registration => registration.participantId === participantId);
  };

  // Get health declaration by participant
  const getHealthDeclarationByParticipant = (participantId: string) => {
    return healthDeclarations.find(healthDeclaration => healthDeclaration.participant_id === participantId);
  };

  // Calculate meeting progress for a product
  const calculateMeetingProgress = (product: Product) => {
    const total = product.meetingsCount || 10;
    // For now, just return a simple calculation. This can be enhanced later.
    const current = 1; // Default to first meeting
    return { current, total };
  };

  // Get all registrations with details
  const getAllRegistrationsWithDetails = () => {
    return registrations.map(registration => {
      const participant = participants.find(p => p.id === registration.participantId);
      const product = products.find(p => p.id === registration.productId);
      const season = seasons.find(s => s.id === product?.seasonId);
      const paymentsForRegistration = payments.filter(payment => payment.registrationId === registration.id);

      if (!participant || !product || !season) {
        console.error('Missing data for registration:', registration);
        return null;
      }

      const { paid, expected, status } = calculatePaymentStatus(registration, paymentsForRegistration);

      return {
        ...registration,
        participant,
        product,
        season,
        payments: paymentsForRegistration,
        paymentStatus: status,
      };
    }).filter(Boolean) as RegistrationWithDetails[];
  };

  // Get pool by ID
  const getPoolById = (id: string) => {
    return pools.find(pool => pool.id === id);
  };

  const getDailyActivities = (date: string) => {
    const parsedDate = new Date(date);
    const dayOfWeek = format(parsedDate, 'EEEE', { locale: heLocale });

    return products.map(product => {
      const registrationsForProduct = getRegistrationsByProduct(product.id);
      const numParticipants = registrationsForProduct.length;
      const progress = calculateMeetingProgress(product);

      return {
        product: product,
        startTime: product.startTime || '00:00',
        numParticipants: numParticipants,
        currentMeetingNumber: progress.current,
        totalMeetings: progress.total,
      };
    });
  };

  // Make sure all functions return Promises as expected by the interface
  const promisifiedAddProduct = async (product: Omit<Product, 'id'>): Promise<Product | undefined> => {
    return await addProduct(product);
  };

  const promisifiedUpdateSeason = async (season: Season): Promise<void> => {
    await updateSeason(season);
  };

  const promisifiedDeleteSeason = async (id: string): Promise<void> => {
    await deleteSeasonContext(id);
  };

  const promisifiedUpdateRegistration = async (registration: Registration): Promise<void> => {
    await updateRegistration(registration);
  };

  const promisifiedDeleteRegistration = async (id: string): Promise<void> => {
    await deleteRegistration(id);
  };

  const promisifiedUpdateParticipant = async (participant: Participant): Promise<void> => {
    await updateParticipant(participant);
  };

  const promisifiedDeleteParticipant = async (id: string): Promise<void> => {
    await deleteParticipant(id);
  };

  const promisifiedUpdatePayment = async (payment: Payment): Promise<void> => {
    await updatePayment(payment);
  };

  const promisifiedDeletePayment = async (id: string): Promise<void> => {
    await deletePayment(id);
  };

  const promisifiedUpdateHealthDeclaration = async (healthDeclaration: HealthDeclaration): Promise<void> => {
    await updateHealthDeclaration(healthDeclaration);
  };

  const contextValue: DataContextProps = {
    seasons,
    products,
    pools,
    participants,
    registrations,
    payments,
    healthDeclarations,
    addProduct: promisifiedAddProduct,
    updateProduct,
    deleteProduct,
    addSeason,
    updateSeason: promisifiedUpdateSeason,
    deleteSeason: promisifiedDeleteSeason,
    addParticipant,
    updateParticipant: promisifiedUpdateParticipant,
    deleteParticipant: promisifiedDeleteParticipant,
    addRegistration,
    updateRegistration: promisifiedUpdateRegistration,
    deleteRegistration: promisifiedDeleteRegistration,
    addPayment,
    updatePayment: promisifiedUpdatePayment,
    deletePayment: promisifiedDeletePayment,
    updateHealthDeclaration: promisifiedUpdateHealthDeclaration,
    addHealthDeclaration,
    getRegistrationsByProduct,
    getRegistrationsByParticipant,
    getAllRegistrationsWithDetails,
    getPaymentsByRegistration,
    getProductsBySeason,
    getProductsByPool,
    getHealthDeclarationByParticipant,
    getPoolsBySeason,
    getPoolById,
    getDailyActivities,
    calculateMeetingProgress,
    addPool,
    updatePool,
    deletePool,
    loading,
  };

  return (
    <DataContext.Provider value={contextValue}>
      <SeasonsProvider>
        <ProductsProvider>
          <ParticipantsProvider>
            <RegistrationsProvider>
              <PaymentsProvider>
                <HealthDeclarationsProvider>
                  <PoolsProvider>
                    {children}
                  </PoolsProvider>
                </HealthDeclarationsProvider>
              </PaymentsProvider>
            </RegistrationsProvider>
          </ParticipantsProvider>
        </ProductsProvider>
      </SeasonsProvider>
    </DataContext.Provider>
  );
};

export default DataContext;
