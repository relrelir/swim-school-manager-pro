
import { createContext, useContext } from 'react';
import { PoolsContextType } from '../types';

// Create the context
export const PoolsContext = createContext<PoolsContextType | null>(null);

// Hook to use the pools context
export const usePoolsContext = () => {
  const context = useContext(PoolsContext);
  if (!context) {
    throw new Error('usePoolsContext must be used within PoolsProvider');
  }
  return context;
};
