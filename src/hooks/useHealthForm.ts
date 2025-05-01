
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
    handleSubmit
  } = useHealthFormState(healthDeclarationId);
  
  return {
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
    handleSubmit
  };
};
