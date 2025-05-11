
import { Season, Product, Participant, Registration, Payment, RegistrationWithDetails, Pool, HealthDeclaration, DailyActivity } from '@/types';

// Create a utility function to calculate current meeting for a product
export const calculateCurrentMeeting = (product: Product) => {
  if (!product.meetingsCount) return { current: 0, total: 0 };
  
  const today = new Date();
  const startDate = new Date(product.startDate);
  const endDate = new Date(product.endDate);
  
  if (today < startDate) return { current: 0, total: product.meetingsCount };
  if (today > endDate) return { current: product.meetingsCount, total: product.meetingsCount };
  
  // Calculate progress based on date range
  const totalDays = (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24);
  const elapsedDays = (today.getTime() - startDate.getTime()) / (1000 * 3600 * 24);
  
  const currentMeeting = Math.ceil((elapsedDays / totalDays) * product.meetingsCount);
  return {
    current: Math.min(currentMeeting, product.meetingsCount),
    total: product.meetingsCount
  };
};

export const buildAllRegistrationsWithDetails = async (
  registrations: Registration[], 
  participants: Participant[], 
  products: Product[], 
  seasons: Season[],
  payments: Payment[],
  getPaymentsByRegistration: (registrationId: string) => Promise<Payment[]>
): Promise<RegistrationWithDetails[]> => {
  const result: RegistrationWithDetails[] = [];

  // Process each registration
  for (const reg of registrations) {
    // Find related product
    const product = products.find(p => p.id === reg.productId);
    if (!product) continue;

    // Find related participant
    const participant = participants.find(p => p.id === reg.participantId);
    if (!participant) continue;

    // Find related season
    const season = seasons.find(s => s.id === product.seasonId);
    if (!season) continue;

    // Find payments for this registration
    const regPayments = await getPaymentsByRegistration(reg.id);

    // Create enriched registration object
    const registrationWithDetails: RegistrationWithDetails = {
      ...reg,
      participant,
      product,
      season,
      payments: regPayments,
      paymentStatus: 'חלקי' // This will be calculated by the consumer using calculatePaymentStatus
    };

    result.push(registrationWithDetails);
  }

  return result;
};

export const getRegistrationsByParticipant = (
  registrations: Registration[],
  participantId: string
): Registration[] => {
  return registrations.filter(reg => reg.participantId === participantId);
};

export const getHealthDeclarationByParticipant = (
  healthDeclarations: HealthDeclaration[],
  participantId: string
): HealthDeclaration | undefined => {
  return healthDeclarations.find(h => h.participant_id === participantId);
};

export const getPoolById = (
  pools: Pool[],
  id: string
): Pool | undefined => {
  return pools.find(pool => pool.id === id);
};

export const calculateMeetingProgress = (product: Product) => {
  return calculateCurrentMeeting(product);
};

export const getDailyActivities = (
  date: string, 
  products: Product[], 
  getRegistrationsByProduct: (productId: string) => Registration[]
): DailyActivity[] => {
  // Get day of week from the date
  const dateObj = new Date(date);
  const dayNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
  const dayOfWeek = dayNames[dateObj.getDay()];

  // Find all products that have this day of week
  const activitiesForToday = products.filter(product => {
    // Check if the product runs on this day of the week
    if (product.daysOfWeek && product.daysOfWeek.includes(dayOfWeek)) {
      // Check if the date is within the product's date range
      const startDate = new Date(product.startDate);
      const endDate = new Date(product.endDate);
      return dateObj >= startDate && dateObj <= endDate;
    }
    return false;
  });

  // Map to DailyActivity objects
  return activitiesForToday.map(product => {
    const registrations = getRegistrationsByProduct(product.id);
    const meetingInfo = calculateCurrentMeeting(product);
    
    return {
      product,
      startTime: product.startTime || '00:00',
      numParticipants: registrations.length,
      currentMeetingNumber: meetingInfo.current,
      totalMeetings: meetingInfo.total
    };
  });
};
