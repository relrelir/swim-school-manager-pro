
import React, { createContext, useContext, useEffect } from 'react';
import { SeasonsContextType } from './types';
import { useSeasons } from '@/hooks/useSeasons';

const SeasonsContext = createContext<SeasonsContextType | null>(null);

export const useSeasonsContext = () => {
  const context = useContext(SeasonsContext);
  if (!context) {
    throw new Error('useSeasonsContext must be used within a SeasonsProvider');
  }
  return context;
};

export const SeasonsProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const {
    seasons,
    fetchSeasons,
    addSeason,
    updateSeason,
    deleteSeason,
    loading
  } = useSeasons();

  // Load seasons when component mounts
  useEffect(() => {
    fetchSeasons();
  }, []);

  const contextValue: SeasonsContextType = {
    seasons,
    addSeason,
    updateSeason,
    deleteSeason,
    loading
  };

  return (
    <SeasonsContext.Provider value={contextValue}>
      {children}
    </SeasonsContext.Provider>
  );
};
