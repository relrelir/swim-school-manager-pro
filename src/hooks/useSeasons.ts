
import { useSeasonsContext } from '@/context/data/SeasonsProvider';

export function useSeasons() {
  // Simply re-export the functionality from the SeasonsContext
  return useSeasonsContext();
}
