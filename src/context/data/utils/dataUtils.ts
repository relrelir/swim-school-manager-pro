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
export const buildAllRegistrationsWithDetails = async (
  registrations,
  participants,
  products,
  seasons,
  payments,
  getPaymentsByRegistration
) => {
  // This function must be adjusted to handle the async nature of getPaymentsByRegistration
  // Since we don't have the full implementation, we're creating a basic outline
  
  const result = [];
  
  for (const registration of registrations) {
    const participant = participants.find(p => p.id === registration.participantId);
    const product = products.find(p => p.id === registration.productId);
    const season = product ? seasons.find(s => s.id === product.seasonId) : null;
    
    // Now we need to await the payments
    const registrationPayments = await getPaymentsByRegistration(registration.id);
    
    result.push({
      registration,
      participant,
      product,
      season,
      payments: registrationPayments
    });
  }
  
  return result;
};

// Export activity utils
export { calculateMeetingProgress, getDailyActivities };
