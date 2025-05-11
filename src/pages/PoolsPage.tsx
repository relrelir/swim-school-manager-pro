
import React from 'react';
import { usePoolsPage } from '@/hooks/usePoolsPage';
import PoolsPageHeader from '@/components/pools/PoolsPageHeader';
import PoolsList from '@/components/pools/PoolsList';
import AddPoolDialog from '@/components/pools/AddPoolDialog';
import EditPoolDialog from '@/components/pools/EditPoolDialog';

const PoolsPage: React.FC = () => {
  const {
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
  } = usePoolsPage();

  return (
    <div className="space-y-6">
      <PoolsPageHeader
        seasonName={currentSeason?.name || ''}
        onBackToSeasons={handleBackToSeasons}
        onAddPool={() => setIsAddPoolDialogOpen(true)}
      />

      <PoolsList
        pools={pools}
        loading={loading}
        deletingPoolId={deletingPoolId}
        onNavigateToProducts={handleNavigateToProducts}
        onEdit={openEditDialog}
        onDelete={handlePoolDelete}
        onAddPool={() => setIsAddPoolDialogOpen(true)}
      />

      <AddPoolDialog
        open={isAddPoolDialogOpen}
        onOpenChange={setIsAddPoolDialogOpen}
        onSubmit={handleAddPool}
        seasonName={currentSeason?.name || ''}
      />

      <EditPoolDialog
        open={isEditPoolDialogOpen}
        onOpenChange={setIsEditPoolDialogOpen}
        onSubmit={handleEditSubmit}
        editingPool={editingPool}
      />
    </div>
  );
};

export default PoolsPage;
