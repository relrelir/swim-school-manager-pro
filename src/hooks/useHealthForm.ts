
import { useMemo } from 'react';
import { useHealthDeclarationLoader } from './health-form/useHealthDeclarationLoader';
import { useHealthFormState } from './health-form/useHealthFormState';

export const useHealthForm = () => {
  const {
    isLoadingData,
    participantName,
    participantId,
    participantPhone,
    error,
    healthDeclarationId
  } = useHealthDeclarationLoader();

  const {
    isLoading,
    formState,
    handleAgreementChange,
    handleNotesChange,
    handleParentNameChange,
    handleParentIdChange,
    handleSignatureChange,
    handleSubmit
  } = useHealthFormState(healthDeclarationId);
  
  // Memoize the returned object to prevent unnecessary re-renders
  const hookResult = useMemo(() => ({
    isLoading,
    isLoadingData,
    participantName,
    participantId,
    participantPhone,
    error,
    formState,
    handleAgreementChange,
    handleNotesChange,
    handleParentNameChange,
    handleParentIdChange,
    handleSignatureChange,
    handleSubmit
  }), [
    isLoading,
    isLoadingData,
    participantName,
    participantId,
    participantPhone,
    error,
    formState,
    handleAgreementChange,
    handleNotesChange,
    handleParentNameChange,
    handleParentIdChange,
    handleSignatureChange,
    handleSubmit
  ]);
  
  return hookResult;
};
