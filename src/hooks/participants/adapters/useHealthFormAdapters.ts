
/**
 * Hook for adapting health form functions to consistent signatures
 */
export const useHealthFormAdapters = (
  baseHandleOpenHealthForm: (registrationId: string) => void
) => {
  // Create an adapter for handleOpenHealthForm
  const adaptedHandleOpenHealthForm = (registrationId: string) => {
    console.log("Adapting health form open for registration:", registrationId);
    return baseHandleOpenHealthForm(registrationId);
  };

  return {
    adaptedHandleOpenHealthForm
  };
};
