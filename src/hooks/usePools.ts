import { useMemo, useState, useEffect } from 'react';
import { Pool, Product } from '@/types';
import { usePoolsContext } from '@/context/data/pools/usePoolsContext';
import { toast } from '@/components/ui/use-toast';
import { mapProductsToPools } from '@/hooks/utils/mapProductsToPools';

export function usePools(seasonId?: string) {
  const { pools, addPool, updatePool, deletePool, getPoolsBySeason, loading: poolsLoading } = usePoolsContext();
  const [isAddPoolDialogOpen, setIsAddPoolDialogOpen] = useState(false);
  const [editingPool, setEditingPool] = useState<Pool | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [poolsWithProducts, setPoolsWithProducts] = useState<Record<string, boolean>>({});
  const [loadingPoolProducts, setLoadingPoolProducts] = useState(true);

  // Get products context to check which pools have products
  const { getProductsByPool, products } = usePoolsContext() as {
    getProductsByPool?: (poolId: string) => Product[],
    products: Product[]
  };
  
  // Filter pools by season if seasonId is provided
  const seasonPools = useMemo(() => {
    if (!seasonId) return pools;
    return getPoolsBySeason(seasonId);
  }, [pools, seasonId, getPoolsBySeason]);
  
  // Calculate which pools have products
  useEffect(() => {
    const calculatePoolsWithProducts = async () => {
      setLoadingPoolProducts(true);
      
      try {
        const poolMap: Record<string, boolean> = {};
        
        // If we have the getProductsByPool helper, use it
        if (getProductsByPool) {
          // For each pool, check if it has products
          for (const pool of seasonPools) {
            const poolProducts = getProductsByPool(pool.id);
            poolMap[pool.id] = poolProducts.length > 0;
          }
        } else {
          // Otherwise use the product list directly
          const poolCounts = mapProductsToPools(products, seasonPools);
          
          // Convert counts to boolean map
          for (const poolId in poolCounts) {
            poolMap[poolId] = poolCounts[poolId] > 0;
          }
        }
        
        setPoolsWithProducts(poolMap);
      } catch (error) {
        console.error('Error calculating pools with products:', error);
      } finally {
        setLoadingPoolProducts(false);
      }
    };
    
    calculatePoolsWithProducts();
  }, [seasonPools, products, getProductsByPool]);

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
    
    // Check if the pool has products
    if (poolsWithProducts[id]) {
      console.log('Cannot delete pool with products:', id);
      toast({
        title: "לא ניתן למחוק",
        description: "לא ניתן למחוק בריכה עם מוצרים",
        variant: "destructive",
      });
      return false;
    }
    
    const confirmDelete = window.confirm("האם אתה בטוח שברצונך למחוק את הבריכה?");
    if (confirmDelete) {
      console.log('Delete confirmed for pool ID:', id);
      setIsDeleting(true);
      
      try {
        const success = await deletePool(id);
        
        if (!success) {
          console.log('Delete pool failed for ID:', id);
          toast({
            title: "לא ניתן למחוק",
            description: "אירעה שגיאה במחיקת הבריכה",
            variant: "destructive",
          });
          return false;
        } else {
          console.log('Delete pool succeeded for ID:', id);
          
          // Force refetch of pools to ensure UI is in sync with database
          const { fetchPools } = await import('@/context/data/pools/poolsService');
          const updatedPools = await fetchPools();
          console.log('Fetched updated pools after deletion:', updatedPools);
          return true;
        }
      } finally {
        setIsDeleting(false);
      }
    } else {
      console.log('Delete cancelled for pool ID:', id);
      return false;
    }
  };

  return {
    pools: seasonPools,
    loading: poolsLoading || isDeleting || loadingPoolProducts,
    isAddPoolDialogOpen,
    setIsAddPoolDialogOpen,
    editingPool,
    setEditingPool,
    handleAddPool,
    handleUpdatePool,
    handleDeletePool,
    poolsWithProducts
  };
}
