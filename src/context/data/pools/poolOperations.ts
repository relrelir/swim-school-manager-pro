
import { Pool } from '@/types';
import * as poolsService from './poolsService';

export const createAddPoolOperation = (
  setPools: React.Dispatch<React.SetStateAction<Pool[]>>
) => {
  return async (pool: { name: string, seasonId: string }): Promise<Pool | null> => {
    const newPool = await poolsService.createPool(pool.name, pool.seasonId);
    
    if (newPool) {
      setPools(prev => [...prev, newPool]);
      return newPool;
    }
    
    return null;
  };
};

export const createUpdatePoolOperation = (
  setPools: React.Dispatch<React.SetStateAction<Pool[]>>
) => {
  return async (pool: Pool): Promise<boolean> => {
    const success = await poolsService.updatePoolName(pool.id, pool.name);
    
    if (success) {
      setPools(prev => prev.map(p => p.id === pool.id ? pool : p));
      return true;
    }
    
    return false;
  };
};

export const createDeletePoolOperation = (
  setPools: React.Dispatch<React.SetStateAction<Pool[]>>
) => {
  return async (id: string): Promise<boolean> => {
    // Check if pool has products
    const hasProducts = await poolsService.hasPoolProducts(id);
    
    if (hasProducts) {
      return false;
    }
    
    // If no products, delete the pool
    const success = await poolsService.deletePoolAndLinks(id);
    
    if (success) {
      setPools(prev => prev.filter(p => p.id !== id));
      return true;
    }
    
    return false;
  };
};
