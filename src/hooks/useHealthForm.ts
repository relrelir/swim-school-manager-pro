
import { useHealthDeclarationLoader } from './health-form/useHealthDeclarationLoader';
import { useHealthFormState } from './health-form/useHealthFormState';

export const useHealthForm = () => {
  const {
    isLoadingData,
    participantName,
    error,
    healthDeclarationId
  } = useHealthDeclarationLoader();

  const {
    isLoading,
    formState,
    handleAgreementChange,
    handleNotesChange,
    handleSubmit
  } = useHealthFormState(healthDeclarationId);
  
  return {
    isLoading,
    isLoadingData,
    participantName,
    error,
    formState,
    handleAgreementChange,
    handleNotesChange,
    handleSubmit
  };
};
