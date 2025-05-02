
/**
 * Hook for handling health form interactions
 */
export const useHealthFormHandlers = (
  baseHandleOpenHealthForm: (registrationId: string) => void
) => {
  // Adapter for opening health form
  const handleOpenHealthForm = (registrationId: string) => {
    console.log("Opening health form for registration:", registrationId);
    return baseHandleOpenHealthForm(registrationId);
  };

  return {
    handleOpenHealthForm
  };
};
