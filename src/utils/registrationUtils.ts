
import { Registration, Participant, Product, Season, Payment, RegistrationWithDetails, PaymentStatus } from '@/types';
import { calculatePaymentStatus } from './paymentUtils';

export const getAllRegistrationsWithDetails = (
  registrations: Registration[], 
  participants: Participant[], 
  products: Product[], 
  seasons: Season[],
  payments: Payment[],
  getPaymentsByRegistration: (registrationId: string) => Payment[]
): RegistrationWithDetails[] => {
  return registrations.map(registration => {
    const participant = participants.find(p => p.id === registration.participantId);
    const product = products.find(p => p.id === registration.productId);
    const season = product ? seasons.find(s => s.id === product.seasonId) : undefined;
    const paymentsForRegistration = getPaymentsByRegistration(registration.id);

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
