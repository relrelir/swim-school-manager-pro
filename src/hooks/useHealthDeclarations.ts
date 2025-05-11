
import { useState } from 'react';
import { HealthDeclaration } from '@/types';
import { useHealthDeclarationsContext } from '@/context/data/HealthDeclarationsProvider';

export const useHealthDeclarations = () => {
  const {
    healthDeclarations,
    addHealthDeclaration,
    updateHealthDeclaration,
    deleteHealthDeclaration,
    loading
  } = useHealthDeclarationsContext();

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

    const healthDeclaration = registrations.find(reg => reg.id === registrationId) as any;

    setCurrentHealthDeclaration({
      registrationId,
      participantName: `${participant.firstName} ${participant.lastName}`,
      phone: participant.phone,
      declaration: healthDeclaration
    });

    setIsHealthFormOpen(true);
  };

  return {
    healthDeclarations,
    updateHealthDeclaration,
    addHealthDeclaration,
    deleteHealthDeclaration,
    loading,
    isHealthFormOpen,
    setIsHealthFormOpen,
    currentHealthDeclaration,
    setCurrentHealthDeclaration,
    handleOpenHealthForm
  };
};
