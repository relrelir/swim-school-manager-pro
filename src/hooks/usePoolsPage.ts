
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Pool } from '@/types';
import { usePools } from '@/hooks/usePools';
import { useData } from '@/context/DataContext';

export const usePoolsPage = () => {
  const { seasonId } = useParams<{ seasonId: string }>();
  const navigate = useNavigate();
  const { seasons } = useData();
  const {
    pools,
    loading,
    isAddPoolDialogOpen,
    setIsAddPoolDialogOpen,
    editingPool,
    setEditingPool,
    handleAddPool,
    handleUpdatePool,
    handleDeletePool
  } = usePools(seasonId);

  const [isEditPoolDialogOpen, setIsEditPoolDialogOpen] = useState(false);
  const [deletingPoolId, setDeletingPoolId] = useState<string | null>(null);
  
  const currentSeason = seasons.find(s => s.id === seasonId);

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
    handleAddPool,
    handleEditSubmit,
    handlePoolDelete,
    handleNavigateToProducts,
    handleBackToSeasons,
    openEditDialog
  };
};
