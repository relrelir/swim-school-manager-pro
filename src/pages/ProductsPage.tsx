
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '@/context/DataContext';
import { Pool } from '@/types';
import { useProductsTable } from '@/hooks/useProductsTable';
import { useIsMobile } from '@/hooks/use-mobile';
import { useProductPageData } from '@/hooks/useProductPageData';
import { useProductManagement } from '@/hooks/useProductManagement';
import ProductsPageLayout from '@/components/products/ProductsPageLayout';

const ProductsPage: React.FC = () => {
  const { seasonId, poolId } = useParams<{ seasonId: string; poolId: string }>();
  const navigate = useNavigate();
  const { pools } = useData();
  const isMobile = useIsMobile();

  const {
    currentSeason,
    seasonProducts,
    summaryData,
    formatDate,
    setSeasonProducts
  } = useProductPageData(seasonId, poolId);

  // Find current pool if poolId is provided
  const [currentPool, setCurrentPool] = useState<Pool | undefined>(undefined);
  
  useEffect(() => {
    if (poolId) {
      const pool = pools.find(p => p.id === poolId);
      setCurrentPool(pool);
    }
  }, [poolId, pools]);

  const {
    isAddProductOpen,
    setIsAddProductOpen,
    isEditProductOpen,
    setIsEditProductOpen,
    editingProduct,
    handleCreateProduct,
    handleEditProduct,
    handleUpdateProduct,
    handleDeleteProduct
  } = useProductManagement({ seasonId, poolId, setSeasonProducts });

  const {
    filter,
    setFilter,
    sortField,
    sortDirection,
    handleSort,
    filteredAndSortedProducts
  } = useProductsTable({ products: seasonProducts });
  
  const handleBackNavigation = () => {
    if (poolId) {
      navigate(`/season/${seasonId}/pools`);
    } else if (seasonId) {
      navigate('/');
    }
  };

  return (
    <ProductsPageLayout
      seasonId={seasonId}
      poolId={poolId}
      currentSeason={currentSeason}
      currentPool={currentPool}
      isMobile={isMobile}
      products={seasonProducts}
      summaryData={summaryData}
      filter={filter}
      setFilter={setFilter}
      sortField={sortField}
      sortDirection={sortDirection}
      handleSort={handleSort}
      filteredAndSortedProducts={filteredAndSortedProducts}
      isAddProductOpen={isAddProductOpen}
      setIsAddProductOpen={setIsAddProductOpen}
      isEditProductOpen={isEditProductOpen}
      setIsEditProductOpen={setIsEditProductOpen}
      editingProduct={editingProduct}
      formatDate={formatDate}
      onBackNavigation={handleBackNavigation}
      onAddProduct={() => setIsAddProductOpen(true)}
      onEditProduct={handleEditProduct}
      onDeleteProduct={handleDeleteProduct}
      onCreateProduct={handleCreateProduct}
      onUpdateProduct={handleUpdateProduct}
    />
  );
};

export default ProductsPage;
