
import { Participant, Registration, Payment, PaymentStatus } from '@/types';

export const useParticipantUtils = (
  participants: Participant[],
  payments: Payment[]
) => {
  // Get participant details for a registration
  const getParticipantForRegistration = (registration: Registration): Participant | undefined => {
    return participants.find(p => p.id === registration.participantId);
  };
  
  // Get payments for a registration
  const getPaymentsForRegistration = (registration: Registration): Payment[] => {
    return payments.filter(p => p.registrationId === registration.id);
  };

  // Get class name for payment status
  const getStatusClassName = (status: PaymentStatus): string => {
    switch (status) {
      case 'מלא':
        return 'bg-status-paid bg-opacity-20 text-green-800';
      case 'חלקי':
        return 'bg-status-partial bg-opacity-20 text-yellow-800';
      case 'הנחה':
        return 'bg-blue-100 bg-opacity-20 text-blue-800';
      case 'יתר':
        return 'bg-status-overdue bg-opacity-20 text-red-800';
      default:
        return '';
    }
  };

  return {
    getParticipantForRegistration,
    getPaymentsForRegistration,
    getStatusClassName
  };
};
