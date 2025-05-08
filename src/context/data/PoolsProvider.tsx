import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Pool, SeasonPool } from '@/types';
import { PoolsContextType } from './types';

// Context
const PoolsContext = createContext<PoolsContextType | null>(null);

export const usePoolsContext = () => {
  const context = useContext(PoolsContext);
  if (!context) {
    throw new Error('usePoolsContext must be used within PoolsProvider');
  }
  return context;
};

// Provider
export const PoolsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pools, setPools] = useState<Pool[]>([]);
  const [seasonPools, setSeasonPools] = useState<SeasonPool[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch pools and season_pools mappings
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [{ data: pData, error: pErr }, { data: spData, error: spErr }] = await Promise.all([
          supabase
            .from<Pool>('pools')
            .select('id, name, created_at, updated_at'),
          supabase
            .from<SeasonPool>('season_pools')
            .select('season_id, pool_id')
        ]);

        if (pErr || spErr) {
          throw pErr || spErr;
        }

        // Transform pools
        if (pData) {
          setPools(
            pData.map(row => ({
              id: row.id,
              name: row.name,
              createdAt: row.created_at,
              updatedAt: row.updated_at
            }))
          );
        }

        if (spData) {
          setSeasonPools(
            spData.map(row => ({
              seasonId: row.season_id,
              poolId: row.pool_id
            }))
          );
        }
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
  const getPoolsBySeason = (seasonId: string): Pool[] => {
    const poolIds = seasonPools.filter(sp => sp.seasonId === seasonId).map(sp => sp.poolId);
    return pools.filter(p => poolIds.includes(p.id));
  };

  // Add a new pool and link to seasons
  const addPool = async (
    pool: Omit<Pool, 'id' | 'createdAt' | 'updatedAt'> & { seasonIds: string[] }
  ): Promise<Pool | undefined> => {
    try {
      // 1. Create pool
      const { data: created, error: createErr } = await supabase
        .from('pools')
        .insert([{ name: pool.name }])
        .select('id, name, created_at, updated_at')
        .single();

      if (createErr) {
        throw createErr;
      }

      if (!created) return;

      const newPool: Pool = {
        id: created.id,
        name: created.name,
        createdAt: created.created_at,
        updatedAt: created.updated_at
      };

      // 2. Link to seasons
      for (const seasonId of pool.seasonIds) {
        const { error: linkErr } = await supabase
          .from('season_pools')
          .insert({ season_id: seasonId, pool_id: newPool.id });
        if (linkErr) throw linkErr;
      }

      setPools(prev => [...prev, newPool]);
      setSeasonPools(prev => [
        ...prev,
        ...pool.seasonIds.map(id => ({ seasonId: id, poolId: newPool.id }))
      ]);

      toast({
        title: 'בריכה נוספה',
        description: `הבריכה ${newPool.name} נוספה בהצלחה`
      });

      return newPool;
    } catch (error) {
      console.error('Error adding pool:', error);
      toast({
        title: 'שגיאה',
        description: 'אירעה שגיאה בהוספת בריכה',
        variant: 'destructive'
      });
    }
  };

  // Update pool name and season links
  const updatePool = async (
    id: string,
    name: string,
    seasonIds: string[]
  ) => {
    try {
      // Update name
      const { error: updErr } = await supabase
        .from('pools')
        .update({ name, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (updErr) throw updErr;

      // Sync season links: remove old and insert new
      await supabase.from('season_pools').delete().eq('pool_id', id);
      for (const seasonId of seasonIds) {
        const { error: linkErr } = await supabase
          .from('season_pools')
          .insert({ season_id: seasonId, pool_id: id });
        if (linkErr) throw linkErr;
      }

      // Update local state
      setPools(prev => prev.map(p => (p.id === id ? { ...p, name } : p)));
      setSeasonPools(prev => [
        ...prev.filter(sp => sp.poolId !== id),
        ...seasonIds.map(seasonId => ({ seasonId, poolId: id }))
      ]);

      toast({
        title: 'בריכה עודכנה',
        description: `הבריכה ${name} עודכנה בהצלחה`
      });
    } catch (error) {
      console.error('Error updating pool:', error);
      toast({
        title: 'שגיאה',
        description: 'אירעה שגיאה בעדכון הבריכה',
        variant: 'destructive'
      });
    }
  };

  // Delete pool after validation
  const deletePool = async (id: string) => {
    try {
      // Prevent deletion if products exist
      const { data: prod, error: prodErr } = await supabase
        .from('products')
        .select('id')
        .eq('pool_id', id);
      if (prodErr) throw prodErr;

      if (prod && prod.length > 0) {
        toast({
          title: 'לא ניתן למחוק',
          description: 'לא ניתן למחוק בריכה שיש לה מוצרים',
          variant: 'destructive'
        });
        return;
      }

      // Delete season links and pool
      await supabase.from('season_pools').delete().eq('pool_id', id);
      const { error: delErr } = await supabase
        .from('pools')
        .delete()
        .eq('id', id);
      if (delErr) throw delErr;

      setPools(prev => prev.filter(p => p.id !== id));
      setSeasonPools(prev => prev.filter(sp => sp.poolId !== id));

      toast({
        title: 'בריכה נמחקה',
        description: 'הבריכה נמחקה בהצלחה'
      });
    } catch (error) {
      console.error('Error deleting pool:', error);
      toast({
        title: 'שגיאה',
        description: 'אירעה שגיאה במחיקת הבריכה',
        variant: 'destructive'
      });
    }
  };

  const contextValue: PoolsContextType = {
    pools,
    getPoolsBySeason,
    addPool,
    updatePool,
    deletePool,
    loading
  };

  return (
    <PoolsContext.Provider value={contextValue}>
      {children}
    </PoolsContext.Provider>
  );
};
