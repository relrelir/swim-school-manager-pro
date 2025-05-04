
import { useState } from 'react';
import { HealthDeclaration } from '@/types';

export const useHealthDeclarations = (
  getHealthDeclarationForRegistration: (registrationId: string) => HealthDeclaration | undefined,
  sendHealthDeclarationSMS: (phone: string, registrationId: string) => Promise<void>,
  addHealthDeclaration: (declaration: Omit<HealthDeclaration, 'id'>) => void,
  updateHealthDeclaration: (declaration: HealthDeclaration) => void
) => {
  const [isHealthFormOpen, setIsHealthFormOpen] = useState(false);
  const [currentHealthDeclaration, setCurrentHealthDeclaration] = useState<{
    registrationId: string;
    participantName: string;
    phone: string;
    declaration?: HealthDeclaration;
  } | null>(null);

  // Handler for opening health form
  const handleOpenHealthForm = (registrationId: string, getParticipantForRegistration: any, registrations: any[]) => {
    const registration = registrations.find(reg => reg.id === registrationId);
    if (!registration) return;

    const participant = getParticipantForRegistration(registration);
    if (!participant) return;

    const healthDeclaration = getHealthDeclarationForRegistration(registrationId);

    setCurrentHealthDeclaration({
      registrationId,
      participantName: `${participant.firstName} ${participant.lastName}`,
      phone: participant.phone,
      declaration: healthDeclaration
    });

    setIsHealthFormOpen(true);
  };

  return {
    isHealthFormOpen,
    setIsHealthFormOpen,
    currentHealthDeclaration,
    setCurrentHealthDeclaration,
    handleOpenHealthForm
  };
};
