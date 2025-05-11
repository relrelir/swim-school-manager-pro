
import { Product, DailyActivity } from '@/types';
import { format } from 'date-fns';
import { heLocale } from './localeSettings';

// Calculate meeting progress for a product
export const calculateMeetingProgress = (product: Product) => {
  const total = product.meetingsCount || 10;
  // For now, just return a simple calculation. This can be enhanced later.
  const current = 1; // Default to first meeting
  return { current, total };
};

export const getDailyActivities = (
  date: string, 
  products: Product[], 
  getRegistrationsByProduct: (productId: string) => any[]
): DailyActivity[] => {
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
