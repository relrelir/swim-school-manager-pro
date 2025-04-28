
import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from "@/components/ui/use-toast";
import { Season } from '@/types';
import { SeasonsContextType } from './types';
import { generateId, loadData, saveData } from './utils';

const SeasonsContext = createContext<SeasonsContextType | null>(null);

export const useSeasonsContext = () => {
  const context = useContext(SeasonsContext);
  if (!context) {
    throw new Error('useSeasonsContext must be used within a SeasonsProvider');
  }
  return context;
};

export const SeasonsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [seasons, setSeasons] = useState<Season[]>(() => loadData('swimSchoolSeasons', []));

  // Save data to localStorage whenever it changes
  useEffect(() => {
    saveData('swimSchoolSeasons', seasons);
  }, [seasons]);

  // Seasons functions
  const addSeason = (season: Omit<Season, 'id'>) => {
    // Check for date overlaps
    const overlapping = seasons.some(existingSeason => {
      const newStart = new Date(season.startDate);
      const newEnd = new Date(season.endDate);
      const existingStart = new Date(existingSeason.startDate);
      const existingEnd = new Date(existingSeason.endDate);
      
      return (
        (newStart >= existingStart && newStart <= existingEnd) ||
        (newEnd >= existingStart && newEnd <= existingEnd) ||
        (newStart <= existingStart && newEnd >= existingEnd)
      );
    });

    if (overlapping) {
      toast({
        title: "שגיאה",
        description: "תאריכי העונה חופפים עם עונה קיימת",
        variant: "destructive",
      });
      return;
    }

    const newSeason = { ...season, id: generateId() };
    setSeasons([...seasons, newSeason]);
  };

  const updateSeason = (season: Season) => {
    setSeasons(seasons.map(s => s.id === season.id ? season : s));
  };

  const deleteSeason = (id: string) => {
    setSeasons(seasons.filter(s => s.id !== id));
  };

  const contextValue: SeasonsContextType = {
    seasons,
    addSeason,
    updateSeason,
    deleteSeason,
  };

  return (
    <SeasonsContext.Provider value={contextValue}>
      {children}
    </SeasonsContext.Provider>
  );
};
