
import React from 'react';
import { HealthDeclarationsContext } from './healthDeclarations/context';
import { useHealthDeclarationsProvider } from './healthDeclarations/useHealthDeclarationsProvider';

export { useHealthDeclarationsContext } from './healthDeclarations/useHealthDeclarations';

export const HealthDeclarationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const healthDeclarationsState = useHealthDeclarationsProvider();

  return (
    <HealthDeclarationsContext.Provider value={healthDeclarationsState}>
      {children}
    </HealthDeclarationsContext.Provider>
  );
};
