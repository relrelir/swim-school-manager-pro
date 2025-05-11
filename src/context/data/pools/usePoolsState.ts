
import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';
import { Pool, SeasonPool } from '@/types';
import * as poolsService from './poolsService';

export const usePoolsState = () => {
  const [pools, setPools] = useState<Pool[]>([]);
  const [seasonPools, setSeasonPools] = useState<SeasonPool[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch pools and season_pools mappings
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [fetchedPools, fetchedSeasonPools] = await Promise.all([
          poolsService.fetchPools(),
          poolsService.fetchSeasonPools()
        ]);
        
        setPools(fetchedPools);
        setSeasonPools(fetchedSeasonPools);
      } catch (error) {
        console.error('Error loading pools data:', error);
        toast({
          title: 'שגיאה',
          description: 'אירעה שגיאה בטעינת בריכות ומיפוי עונות',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Get pools by season
  const getPoolsBySeason = useCallback((seasonId: string): Pool[] => {
    const poolIds = seasonPools
      .filter(sp => sp.seasonId === seasonId)
      .map(sp => sp.poolId);
    return pools.filter(p => poolIds.includes(p.id));
  }, [pools, seasonPools]);

  return {
    pools,
    setPools,
    seasonPools,
    setSeasonPools,
    loading,
    getPoolsBySeason
  };
};
