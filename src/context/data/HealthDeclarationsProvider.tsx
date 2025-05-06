
import React, { useMemo } from 'react';
import { HealthDeclarationsContext } from './healthDeclarations/context';
import { useHealthDeclarationsProvider } from './healthDeclarations/useHealthDeclarationsProvider';

export { useHealthDeclarationsContext } from './healthDeclarations/useHealthDeclarations';

export const HealthDeclarationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const healthDeclarationsState = useHealthDeclarationsProvider();
  
  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => healthDeclarationsState, [healthDeclarationsState]);

  return (
    <HealthDeclarationsContext.Provider value={contextValue}>
      {children}
    </HealthDeclarationsContext.Provider>
  );
};
