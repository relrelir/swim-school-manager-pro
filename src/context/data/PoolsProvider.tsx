
import React from 'react';
import { PoolsContext } from './pools/usePoolsContext';
import { usePoolsState } from './pools/usePoolsState';
import { createAddPoolOperation, createUpdatePoolOperation, createDeletePoolOperation } from './pools/poolOperations';
import { PoolsContextType } from './types';

// Provider
export const PoolsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Use the extracted hook for state management
  const { 
    pools, 
    setPools, 
    loading, 
    getPoolsBySeason 
  } = usePoolsState();

  // Create operations using the extracted functions
  const addPool = createAddPoolOperation(setPools);
  const updatePool = createUpdatePoolOperation(setPools);
  const deletePool = createDeletePoolOperation(setPools);

  // Combine everything into the context value
  const contextValue: PoolsContextType = {
    pools,
    getPoolsBySeason,
    addPool,
    updatePool,
    deletePool,
    loading
  };

  // Provide the context to the component tree
  return (
    <PoolsContext.Provider value={contextValue}>
      {children}
    </PoolsContext.Provider>
  );
};

// Re-export the usePoolsContext hook for convenience
export { usePoolsContext } from './pools/usePoolsContext';
