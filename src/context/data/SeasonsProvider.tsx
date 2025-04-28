
import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from "@/components/ui/use-toast";
import { Season } from '@/types';
import { SeasonsContextType } from './types';
import { generateId, handleSupabaseError } from './utils';
import { supabase } from '@/integrations/supabase/client';

const SeasonsContext = createContext<SeasonsContextType | null>(null);

export const useSeasonsContext = () => {
  const context = useContext(SeasonsContext);
  if (!context) {
    throw new Error('useSeasonsContext must be used within a SeasonsProvider');
  }
  return context;
};

export const SeasonsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);

  // Load seasons from Supabase
  useEffect(() => {
    const fetchSeasons = async () => {
      try {
        const { data, error } = await supabase
          .from('seasons')
          .select('*');

        if (error) {
          handleSupabaseError(error, 'fetching seasons');
        }

        // Transform data to match our Season type
        const transformedSeasons: Season[] = data?.map(season => ({
          id: season.id,
          name: season.name,
          startDate: season.startDate,
          endDate: season.endDate
        })) || [];

        setSeasons(transformedSeasons);
      } catch (error) {
        console.error('Error loading seasons:', error);
        toast({
          title: "שגיאה",
          description: "אירעה שגיאה בטעינת עונות",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSeasons();
  }, []);

  // Seasons functions
  const addSeason = async (season: Omit<Season, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('seasons')
        .insert([season])
        .select()
        .single();

      if (error) {
        handleSupabaseError(error, 'adding season');
      }

      if (data) {
        const newSeason: Season = {
          id: data.id,
          name: data.name,
          startDate: data.startDate,
          endDate: data.endDate
        };
        setSeasons([...seasons, newSeason]);
      }
    } catch (error) {
      console.error('Error adding season:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בהוספת עונה חדשה",
        variant: "destructive",
      });
    }
  };

  const updateSeason = async (season: Season) => {
    try {
      const { error } = await supabase
        .from('seasons')
        .update({
          name: season.name,
          startDate: season.startDate,
          endDate: season.endDate
        })
        .eq('id', season.id);

      if (error) {
        handleSupabaseError(error, 'updating season');
      }

      setSeasons(seasons.map(s => s.id === season.id ? season : s));
    } catch (error) {
      console.error('Error updating season:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בעדכון עונה",
        variant: "destructive",
      });
    }
  };

  const deleteSeason = async (id: string) => {
    try {
      const { error } = await supabase
        .from('seasons')
        .delete()
        .eq('id', id);

      if (error) {
        handleSupabaseError(error, 'deleting season');
      }

      setSeasons(seasons.filter(s => s.id !== id));
    } catch (error) {
      console.error('Error deleting season:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה במחיקת עונה",
        variant: "destructive",
      });
    }
  };

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
