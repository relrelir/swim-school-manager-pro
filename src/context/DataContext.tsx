
import { createContext, useContext } from 'react';
import { DataContextType } from './data/types';
import { DataProvider as DataProviderImplementation } from './data/DataProvider';

// Create the context
const DataContext = createContext<DataContextType | null>(null);

// Hook for using the context
export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

// Export the provider from our implementation
export const DataProvider = DataProviderImplementation;

// Export the context for use in DataProviderCombiner
export { DataContext };
