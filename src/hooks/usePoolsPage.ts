
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Pool } from '@/types';
import { usePools } from '@/hooks/usePools';
import { useData } from '@/context/DataContext';

export const usePoolsPage = () => {
  const { seasonId } = useParams<{ seasonId: string }>();
  const navigate = useNavigate();
  const { seasons, products, getProductsByPool } = useData();
  const {
    pools,
    loading,
    isAddPoolDialogOpen,
    setIsAddPoolDialogOpen,
    editingPool,
    setEditingPool,
    handleAddPool,
    handleUpdatePool,
    handleDeletePool,
    poolsWithProducts
  } = usePools(seasonId);

  const [isEditPoolDialogOpen, setIsEditPoolDialogOpen] = useState(false);
  const [deletingPoolId, setDeletingPoolId] = useState<string | null>(null);
  
  const currentSeason = seasons.find(s => s.id === seasonId);

  // Calculate which pools have products
  const [calculatedPoolsWithProducts, setCalculatedPoolsWithProducts] = useState<Record<string, boolean>>({});
  
  useEffect(() => {
    if (!getProductsByPool || !pools) return;
    
    const poolMap: Record<string, boolean> = {};
    
    // For each pool, check if it has products
    pools.forEach(pool => {
      const poolProducts = getProductsByPool(pool.id);
      poolMap[pool.id] = poolProducts.length > 0;
    });
    
    setCalculatedPoolsWithProducts(poolMap);
  }, [pools, products, getProductsByPool]);

  const openEditDialog = (pool: Pool) => {
    setEditingPool(pool);
    setIsEditPoolDialogOpen(true);
  };

  const handleEditSubmit = (pool: Pool) => {
    handleUpdatePool(pool);
    setIsEditPoolDialogOpen(false);
  };

  const handleNavigateToProducts = (poolId: string) => {
    navigate(`/season/${seasonId}/pool/${poolId}/products`);
  };
  
  const handleBackToSeasons = () => {
    navigate('/');
  };

  const handlePoolDelete = async (poolId: string) => {
    setDeletingPoolId(poolId);
    await handleDeletePool(poolId);
    setDeletingPoolId(null);
  };

  // Use either the calculated map or the one from usePools hook
  const finalPoolsWithProducts = Object.keys(poolsWithProducts).length > 0 
    ? poolsWithProducts 
    : calculatedPoolsWithProducts;

  return {
    pools,
    loading,
    currentSeason,
    isAddPoolDialogOpen,
    setIsAddPoolDialogOpen,
    isEditPoolDialogOpen,
    setIsEditPoolDialogOpen,
    editingPool,
    deletingPoolId,
    poolsWithProducts: finalPoolsWithProducts,
    handleAddPool,
    handleEditSubmit,
    handlePoolDelete,
    handleNavigateToProducts,
    handleBackToSeasons,
    openEditDialog
  };
};
