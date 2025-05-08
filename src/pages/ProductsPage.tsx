
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
import { toast } from '@/components/ui/use-toast';

const ProductsPage: React.FC = () => {
  const { seasonId } = useParams<{ seasonId: string }>();
  const { addProduct, getProductsBySeason, updateProduct, deleteProduct, getRegistrationsByProduct } = useData();

  const isMobile = useIsMobile();

  const {
    currentSeason,
    seasonProducts,
    summaryData,
    formatDate,
    setSeasonProducts
  } = useProductPageData(seasonId);

  const handleDeleteProduct = (product: Product) => {
    // Using getRegistrationsByProduct from component level
    const productRegistrations = getRegistrationsByProduct(product.id);
    const hasRegistrations = productRegistrations && productRegistrations.length > 0;
    
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

    if (product.id) {
      deleteProduct(product.id).then(() => {
        if (seasonId) {
          setSeasonProducts(getProductsBySeason(seasonId));
        }
      });
    }
  };

  const {
    filter,
    setFilter,
    sortField,
    sortDirection,
    handleSort,
    filteredAndSortedProducts
  } = useProductsTable({ products: seasonProducts });

  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const handleCreateProduct = (product: Omit<Product, 'id'>) => {
    addProduct(product);
    setIsAddProductOpen(false);
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
      if (seasonId) {
        setSeasonProducts(getProductsBySeason(seasonId));
      }
    }
  };

  return (
    <div className="container mx-auto">
      <ProductPageHeader 
        currentSeason={currentSeason} 
        formatDate={formatDate}
        onAddProduct={() => setIsAddProductOpen(true)} 
      />

      {currentSeason && (
        <SeasonSummaryCards
          products={seasonProducts}
          registrationsCount={summaryData.registrationsCount}
          totalExpected={summaryData.totalExpected}
          totalPaid={summaryData.totalPaid}
        />
      )}

      <ProductFilter filter={filter} setFilter={setFilter} />

      <ProductTableSection 
        products={filteredAndSortedProducts}
        sortField={sortField}
        sortDirection={sortDirection}
        handleSort={handleSort}
        onEditProduct={handleEditProduct}
        onDeleteProduct={handleDeleteProduct}
      />

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
