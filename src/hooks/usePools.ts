
import { useMemo, useState } from 'react';
import { Pool } from '@/types';
import { usePoolsContext } from '@/context/data/pools/usePoolsContext';
import { toast } from '@/components/ui/use-toast';

export function usePools(seasonId?: string) {
  const { pools, addPool, updatePool, deletePool, getPoolsBySeason, loading } = usePoolsContext();
  const [isAddPoolDialogOpen, setIsAddPoolDialogOpen] = useState(false);
  const [editingPool, setEditingPool] = useState<Pool | null>(null);

  // Filter pools by season if seasonId is provided
  const seasonPools = useMemo(() => {
    if (!seasonId) return pools;
    return getPoolsBySeason(seasonId);
  }, [pools, seasonId, getPoolsBySeason]);

  const handleAddPool = async (name: string) => {
    if (!seasonId) {
      toast({
        title: "שגיאה",
        description: "לא נבחרה עונה",
        variant: "destructive",
      });
      return;
    }

    await addPool({ 
      name, 
      seasonId 
    });
    
    setIsAddPoolDialogOpen(false);
  };

  const handleUpdatePool = async (pool: Pool) => {
    await updatePool(pool);
    setEditingPool(null);
  };

  const handleDeletePool = async (id: string) => {
    console.log('Delete pool requested for ID:', id);
    
    const confirmDelete = window.confirm("האם אתה בטוח שברצונך למחוק את הבריכה?");
    if (confirmDelete) {
      console.log('Delete confirmed for pool ID:', id);
      const success = await deletePool(id);
      
      if (!success) {
        console.log('Delete pool failed for ID:', id);
        toast({
          title: "לא ניתן למחוק",
          description: "לא ניתן למחוק בריכה עם מוצרים",
          variant: "destructive",
        });
      } else {
        console.log('Delete pool succeeded for ID:', id);
      }
    } else {
      console.log('Delete cancelled for pool ID:', id);
    }
  };

  return {
    pools: seasonPools,
    loading,
    isAddPoolDialogOpen,
    setIsAddPoolDialogOpen,
    editingPool,
    setEditingPool,
    handleAddPool,
    handleUpdatePool,
    handleDeletePool
  };
}
