
import { useState } from 'react';
import { HealthDeclaration, Participant, Registration } from '@/types';
import { useHealthDeclarationHandling } from './participants/health/useHealthDeclarationHandling';
import { useHealthDeclarationActions } from './participants/health/useHealthDeclarationActions';

/**
 * Composition hook for health-related functionality
 */
export const useParticipantHealth = (
  getHealthDeclarationForRegistration: (registrationId: string) => HealthDeclaration | undefined,
  addHealthDeclaration: (declaration: Partial<HealthDeclaration>) => Promise<HealthDeclaration | undefined>,
  updateParticipant: (id: string, data: Partial<Participant>) => Promise<Participant>,
  participants: Participant[],
  registrations: Registration[]
) => {
  // Use the refactored health declaration handling hook
  const {
    isLinkDialogOpen,
    setIsLinkDialogOpen,
    currentHealthDeclaration,
    setCurrentHealthDeclaration
  } = useHealthDeclarationHandling();
  
  // Use the refactored health declaration actions hook
  const {
    handleOpenHealthForm,
    handleUpdateHealthApproval
  } = useHealthDeclarationActions(
    getHealthDeclarationForRegistration,
    addHealthDeclaration,
    updateParticipant,
    participants,
    registrations,
    setCurrentHealthDeclaration,
    setIsLinkDialogOpen
  );

  return {
    isLinkDialogOpen,
    setIsLinkDialogOpen,
    currentHealthDeclaration,
    setCurrentHealthDeclaration,
    handleOpenHealthForm,
    handleUpdateHealthApproval
  };
};
