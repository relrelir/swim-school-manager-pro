
import { useState } from 'react';
import { toast } from "@/components/ui/use-toast";
import { Season } from '@/types';
import { handleSupabaseError, mapSeasonFromDB, mapSeasonToDB } from '@/context/data/utils';
import { supabase } from '@/integrations/supabase/client';

export function useSeasons() {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);

  // Load seasons from Supabase
  const fetchSeasons = async () => {
    try {
      const { data, error } = await supabase
        .from('seasons')
        .select('*');

      if (error) {
        handleSupabaseError(error, 'fetching seasons');
      }

      // Transform data to match our Season type
      const transformedSeasons: Season[] = data?.map(season => mapSeasonFromDB(season)) || [];

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

  // Seasons functions
  const addSeason = async (season: Omit<Season, 'id'>) => {
    try {
      const dbSeason = mapSeasonToDB(season);
      
      const { data, error } = await supabase
        .from('seasons')
        .insert([dbSeason])
        .select()
        .single();

      if (error) {
        handleSupabaseError(error, 'adding season');
      }

      if (data) {
        const newSeason = mapSeasonFromDB(data);
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
      const { id, ...seasonData } = season;
      const dbSeason = mapSeasonToDB(seasonData);
      
      const { error } = await supabase
        .from('seasons')
        .update(dbSeason)
        .eq('id', id);

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

  return {
    seasons,
    fetchSeasons,
    addSeason,
    updateSeason,
    deleteSeason,
    loading,
    setLoading
  };
}
