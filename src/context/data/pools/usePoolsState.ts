
import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';
import { Pool } from '@/types';
import * as poolsService from './poolsService';

export const usePoolsState = () => {
  const [pools, setPools] = useState<Pool[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch pools
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const fetchedPools = await poolsService.fetchPools();
        setPools(fetchedPools);
      } catch (error) {
        console.error('Error loading pools data:', error);
        toast({
          title: 'שגיאה',
          description: 'אירעה שגיאה בטעינת בריכות',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Get pools by season using direct relationship
  const getPoolsBySeason = useCallback((seasonId: string): Pool[] => {
    return pools.filter(pool => pool.seasonId === seasonId);
  }, [pools]);

  return {
    pools,
    setPools,
    loading,
    getPoolsBySeason
  };
};
