
import { toast } from '@/components/ui/use-toast';
import { Pool } from '@/types';
import * as poolsService from './poolsService';

export const createAddPoolOperation = (
  setPools: React.Dispatch<React.SetStateAction<Pool[]>>,
  setSeasonPools: React.Dispatch<React.SetStateAction<{ seasonId: string; poolId: string }[]>>
) => {
  return async (
    pool: Omit<Pool, 'id' | 'createdAt' | 'updatedAt'> & { seasonId?: string; seasonIds?: string[] }
  ): Promise<Pool | undefined> => {
    try {
      // Ensure we have seasonIds array to work with
      const seasonIdsArray = pool.seasonIds || (pool.seasonId ? [pool.seasonId] : []);
      
      // 1. Create pool
      const newPool = await poolsService.createPool(pool.name);
      if (!newPool) return;

      // 2. Link to seasons
      for (const seasonId of seasonIdsArray) {
        await poolsService.linkPoolToSeason(newPool.id, seasonId);
      }

      setPools(prev => [...prev, newPool]);
      setSeasonPools(prev => [
        ...prev,
        ...seasonIdsArray.map(id => ({ seasonId: id, poolId: newPool.id }))
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
};

export const createUpdatePoolOperation = (
  setPools: React.Dispatch<React.SetStateAction<Pool[]>>
) => {
  return async (pool: Pool): Promise<void> => {
    try {
      // Update name
      const success = await poolsService.updatePoolName(pool.id, pool.name);
      if (!success) return;

      // Update local state
      setPools(prev => prev.map(p => (p.id === pool.id ? { ...p, name: pool.name } : p)));

      toast({
        title: 'בריכה עודכנה',
        description: `הבריכה ${pool.name} עודכנה בהצלחה`
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
};

export const createDeletePoolOperation = (
  setPools: React.Dispatch<React.SetStateAction<Pool[]>>,
  setSeasonPools: React.Dispatch<React.SetStateAction<{ seasonId: string; poolId: string }[]>>
) => {
  return async (id: string): Promise<void> => {
    try {
      // Prevent deletion if products exist
      const hasProducts = await poolsService.hasPoolProducts(id);
      
      if (hasProducts) {
        toast({
          title: 'לא ניתן למחוק',
          description: 'לא ניתן למחוק בריכה שיש לה מוצרים',
          variant: 'destructive'
        });
        return;
      }

      // Delete season links and pool
      const success = await poolsService.deletePoolAndLinks(id);
      if (!success) return;

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
};
