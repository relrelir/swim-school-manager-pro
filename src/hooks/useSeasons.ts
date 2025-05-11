
import { useSeasonsContext } from '@/context/data/SeasonsProvider';
import { SeasonsContextType } from '@/context/data/types';

export function useSeasons(): SeasonsContextType {
  try {
    // Attempt to use the SeasonsContext
    return useSeasonsContext();
  } catch (error) {
    // If the hook is called outside of a SeasonsProvider,
    // return empty defaults to prevent the app from crashing
    console.error('useSeasons must be used within a SeasonsProvider', error);
    
    // Return default empty values that match the context type
    return {
      seasons: [],
      addSeason: async () => undefined,
      updateSeason: () => {},
      deleteSeason: () => {},
      loading: false,
    };
  }
}
