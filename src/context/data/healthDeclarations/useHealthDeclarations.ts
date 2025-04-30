
import { useContext } from 'react';
import { HealthDeclarationsContext } from './context';

export const useHealthDeclarationsContext = () => {
  const context = useContext(HealthDeclarationsContext);
  if (!context) {
    throw new Error('useHealthDeclarationsContext must be used within a HealthDeclarationsProvider');
  }
  return context;
};
