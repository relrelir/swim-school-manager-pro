
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useData } from '@/context/DataContext';
import { Product } from '@/types';
import { useProductsTable } from '@/hooks/useProductsTable';
import { useIsMobile } from '@/hooks/use-mobile';
import { useProductPageData } from '@/hooks/useProductPageData';
import SeasonSummaryCards from '@/components/seasons/SeasonSummaryCards';
import ProductPageHeader from '@/components/products/ProductPageHeader';
import ProductFilter from '@/components/products/ProductFilter';
import ProductTableSection from '@/components/products/ProductTableSection';
import ProductDialogs from '@/components/products/ProductDialogs';

const ProductsPage: React.FC = () => {
  const { seasonId } = useParams<{ seasonId: string }>();
  const { addProduct, getProductsBySeason, updateProduct } = useData();
  const isMobile = useIsMobile();
  
  // Get product page data using the custom hook
  const {
    currentSeason,
    seasonProducts,
    summaryData,
    formatDate,
    setSeasonProducts
  } = useProductPageData(seasonId);

  const handleDeleteProduct = (product: Product) => {
  const hasRegistrations = product.registrationCount && product.registrationCount > 0;
  if (hasRegistrations) {
    toast({
      title: "לא ניתן למחוק",
      description: "לא ניתן למחוק מוצר עם נרשמים",
      variant: "destructive",
    });
    return;
  }

  const confirmDelete = window.confirm("האם אתה בטוח שברצונך למחוק את המוצר?");
  if (!confirmDelete) return;

  // מחיקה מה-Database
  if (product.id) {
    dataContext.deleteProduct(product.id);
    if (seasonId) {
      setSeasonProducts(getProductsBySeason(seasonId)); // רענון רשימה
    }
  }
};

  
  // Use our custom hook for filtering and sorting
  const { 
    filter, 
    setFilter, 
    sortField, 
    sortDirection, 
    handleSort, 
    filteredAndSortedProducts 
  } = useProductsTable({ products: seasonProducts });
  
  // Dialog states
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Event handlers
  const handleCreateProduct = (product: Omit<Product, 'id'>) => {
    addProduct(product);
    setIsAddProductOpen(false);
    // Refresh products list
    if (seasonId) {
      setSeasonProducts(getProductsBySeason(seasonId));
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsEditProductOpen(true);
  };

  const handleUpdateProduct = (updatedData: Partial<Product>) => {
    if (editingProduct) {
      updateProduct({ ...editingProduct, ...updatedData });
      setIsEditProductOpen(false);
      setEditingProduct(null);
      // Refresh products list
      if (seasonId) {
        setSeasonProducts(getProductsBySeason(seasonId));
      }
    }
  };
  
  return (
    <div className="container mx-auto">
      {/* Page Header */}
      <ProductPageHeader 
        currentSeason={currentSeason} 
        formatDate={formatDate}
        onAddProduct={() => setIsAddProductOpen(true)} 
      />
      
      {/* Season Summary Cards */}
      {currentSeason && (
        <SeasonSummaryCards
          products={seasonProducts}
          registrationsCount={summaryData.registrationsCount}
          totalExpected={summaryData.totalExpected}
          totalPaid={summaryData.totalPaid}
        />
      )}

      {/* Search and Filter */}
      <ProductFilter filter={filter} setFilter={setFilter} />

      {/* Products Table */}
      <ProductTableSection 
        products={filteredAndSortedProducts}
        sortField={sortField}
        sortDirection={sortDirection}
        handleSort={handleSort}
        onEditProduct={handleEditProduct}
      />

      {/* Dialogs */}
      <ProductDialogs 
        isMobile={isMobile}
        isAddProductOpen={isAddProductOpen}
        setIsAddProductOpen={setIsAddProductOpen}
        isEditProductOpen={isEditProductOpen}
        setIsEditProductOpen={setIsEditProductOpen}
        editingProduct={editingProduct}
        currentSeason={currentSeason}
        onCreateProduct={handleCreateProduct}
        onUpdateProduct={handleUpdateProduct}
      />
    </div>
  );
};

export default ProductsPage;
