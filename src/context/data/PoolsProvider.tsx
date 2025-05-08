
import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from "@/components/ui/use-toast";
import { Pool } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { PoolsContextType } from './types';

// Create a context for pools data
const PoolsContext = createContext<PoolsContextType | null>(null);

export const usePoolsContext = () => {
  const context = useContext(PoolsContext);
  if (!context) {
    throw new Error('usePoolsContext must be used within a PoolsProvider');
  }
  return context;
};

export const PoolsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pools, setPools] = useState<Pool[]>([]);
  const [loading, setLoading] = useState(true);

  // Load pools from Supabase
  useEffect(() => {
    const fetchPools = async () => {
      try {
        const { data, error } = await supabase
          .from('pools')
          .select('*');

        if (error) {
          throw error;
        }

        if (data) {
          // Transform data to match our Pool type
          const transformedPools: Pool[] = data.map(pool => ({
            id: pool.id,
            name: pool.name,
            seasonId: pool.seasonid,
            createdAt: pool.created_at,
            updatedAt: pool.updated_at
          }));
          
          setPools(transformedPools);
        }
      } catch (error) {
        console.error('Error loading pools:', error);
        toast({
          title: "שגיאה",
          description: "אירעה שגיאה בטעינת בריכות",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPools();
  }, []);

  // Add a pool
  const addPool = async (pool: Omit<Pool, 'id' | 'createdAt' | 'updatedAt'>): Promise<Pool | undefined> => {
    try {
      const { data, error } = await supabase
        .from('pools')
        .insert([{ 
          name: pool.name,
          seasonid: pool.seasonId
        }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        const newPool: Pool = {
          id: data.id,
          name: data.name,
          seasonId: data.seasonid,
          createdAt: data.created_at,
          updatedAt: data.updated_at
        };
        
        setPools(prevPools => [...prevPools, newPool]);
        
        toast({
          title: "בריכה נוספה",
          description: `הבריכה ${pool.name} נוספה בהצלחה`,
        });
        
        return newPool;
      }
    } catch (error) {
      console.error('Error adding pool:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בהוספת בריכה חדשה",
        variant: "destructive",
      });
    }
    return undefined;
  };

  // Update a pool
  const updatePool = async (pool: Pool) => {
    try {
      const { error } = await supabase
        .from('pools')
        .update({
          name: pool.name,
          seasonid: pool.seasonId,
          updated_at: new Date().toISOString()
        })
        .eq('id', pool.id);

      if (error) {
        throw error;
      }

      // Update state
      setPools(prevPools =>
        prevPools.map(p => (p.id === pool.id ? pool : p))
      );
      
      toast({
        title: "בריכה עודכנה",
        description: `הבריכה ${pool.name} עודכנה בהצלחה`,
      });
    } catch (error) {
      console.error('Error updating pool:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בעדכון הבריכה",
        variant: "destructive",
      });
    }
  };

  // Delete a pool
  const deletePool = async (id: string) => {
    try {
      // Check if pool has products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('id')
        .eq('poolid', id);

      if (productsError) {
        throw productsError;
      }

      if (productsData && productsData.length > 0) {
        toast({
          title: "לא ניתן למחוק",
          description: "לא ניתן למחוק בריכה שיש לה מוצרים",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('pools')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      // Update state
      setPools(prevPools => prevPools.filter(p => p.id !== id));
      
      toast({
        title: "בריכה נמחקה",
        description: "הבריכה נמחקה בהצלחה",
      });
    } catch (error) {
      console.error('Error deleting pool:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה במחיקת הבריכה",
        variant: "destructive",
      });
    }
  };

const getPoolsBySeason = async (seasonId: string) => {
  const { data, error } = await supabase
    .from<SeasonPool & Pool>('season_pools')
    .select('pool!inner(*)')
    .eq('seasonId', seasonId);
  if (error) { toast({ title: error.message }); return []; }
  return data.map(r => r.pool);
};

  
  // Get pools by season
//  const getPoolsBySeason = (seasonId: string) => {
 //   return pools.filter(pool => pool.seasonId === seasonId);
 // };

  const contextValue: PoolsContextType = {
    pools,
    addPool,
    updatePool,
    deletePool,
    getPoolsBySeason,
    loading
  };

  return (
    <PoolsContext.Provider value={contextValue}>
      {children}
    </PoolsContext.Provider>
  );
};
