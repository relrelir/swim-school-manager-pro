
export const useHealthFormHandlers = (
  baseHandleOpenHealthForm: (registrationId: string) => void
) => {
  const handleOpenHealthForm = (registrationId: string) => {
    return baseHandleOpenHealthForm(registrationId);
  };

  return {
    handleOpenHealthForm
  };
};
