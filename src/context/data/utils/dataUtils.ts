
import { Product, Registration, Participant, Season, Pool, Payment, HealthDeclaration } from '@/types';
import { getAllRegistrationsWithDetails } from '@/utils/registrationUtils';
import { calculateMeetingProgress, getDailyActivities } from '@/utils/activityUtils';

// Get registrations by participant
export const getRegistrationsByParticipant = (
  registrations: Registration[],
  participantId: string
): Registration[] => {
  return registrations.filter(registration => registration.participantId === participantId);
};

// Get health declaration by participant
export const getHealthDeclarationByParticipant = (
  healthDeclarations: HealthDeclaration[],
  participantId: string
): HealthDeclaration | undefined => {
  return healthDeclarations.find(healthDeclaration => healthDeclaration.participant_id === participantId);
};

// Get pool by ID
export const getPoolById = (
  pools: Pool[],
  id: string
): Pool | undefined => {
  return pools.find(pool => pool.id === id);
};

// Build all registrations with details
export const buildAllRegistrationsWithDetails = (
  registrations: Registration[],
  participants: Participant[],
  products: Product[],
  seasons: Season[],
  payments: Payment[],
  getPaymentsByRegistration: (registrationId: string) => Payment[]
) => {
  return getAllRegistrationsWithDetails(
    registrations,
    participants,
    products,
    seasons,
    payments,
    getPaymentsByRegistration
  );
};

// Export activity utils
export { calculateMeetingProgress, getDailyActivities };
