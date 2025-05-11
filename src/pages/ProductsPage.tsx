
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '@/context/DataContext';
import { Product, Pool } from '@/types';
import { useProductsTable } from '@/hooks/useProductsTable';
import { useIsMobile } from '@/hooks/use-mobile';
import { useProductPageData } from '@/hooks/useProductPageData';
import SeasonSummaryCards from '@/components/seasons/SeasonSummaryCards';
import PoolProductSummaryCards from '@/components/pools/PoolProductSummaryCards';
import ProductPageHeader from '@/components/products/ProductPageHeader';
import ProductFilter from '@/components/products/ProductFilter';
import ProductTableSection from '@/components/products/ProductTableSection';
import ProductDialogs from '@/components/products/ProductDialogs';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbSeparator 
} from '@/components/ui/breadcrumb';

const ProductsPage: React.FC = () => {
  const { seasonId, poolId } = useParams<{ seasonId: string; poolId: string }>();
  const navigate = useNavigate();
  const { 
    addProduct, 
    getProductsBySeason, 
    getProductsByPool, 
    updateProduct, 
    deleteProduct, 
    getRegistrationsByProduct,
    pools,
    seasons
  } = useData();

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
        if (poolId) {
          setSeasonProducts(getProductsByPool(poolId));
        } else if (seasonId) {
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
    // Add poolId to product if we're in pool context
    const productWithPool = poolId 
      ? { ...product, poolId } 
      : product;
      
    addProduct(productWithPool);
    setIsAddProductOpen(false);
    
    // Refresh products list based on context
    if (poolId) {
      setSeasonProducts(getProductsByPool(poolId));
    } else if (seasonId) {
      setSeasonProducts(getProductsBySeason(seasonId));
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsEditProductOpen(true);
  };

  const handleUpdateProduct = (updatedData: Partial<Product>) => {
    if (editingProduct) {
      // Preserve poolId in update data
      const productUpdate = {
        ...editingProduct,
        ...updatedData,
        poolId: poolId || editingProduct.poolId
      };
      
      updateProduct(productUpdate);
      setIsEditProductOpen(false);
      setEditingProduct(null);
      
      // Refresh products list based on context
      if (poolId) {
        setSeasonProducts(getProductsByPool(poolId));
      } else if (seasonId) {
        setSeasonProducts(getProductsBySeason(seasonId));
      }
    }
  };
  
  const handleBackNavigation = () => {
    if (poolId) {
      navigate(`/season/${seasonId}/pools`);
    } else if (seasonId) {
      navigate('/');
    }
  };

  // Build breadcrumb navigation
  const renderBreadcrumbs = () => {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">עונות</BreadcrumbLink>
          </BreadcrumbItem>
          {seasonId && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href={`/season/${seasonId}/pools`}>
                  בריכות - {currentSeason?.name || ''}
                </BreadcrumbLink>
              </BreadcrumbItem>
            </>
          )}
          {poolId && currentPool && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <span className="font-bold">מוצרים - {currentPool.name}</span>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>
    );
  };

  return (
    <div className="container mx-auto">
      <div className="mb-4">
        {renderBreadcrumbs()}
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <ProductPageHeader 
          currentSeason={currentSeason}
          currentPool={currentPool} 
          formatDate={formatDate}
          onAddProduct={() => setIsAddProductOpen(true)} 
        />
        
        <Button variant="outline" onClick={handleBackNavigation} className="flex items-center gap-2">
          <ChevronLeft className="h-4 w-4" />
          <span>חזרה {poolId ? 'לבריכות' : 'לעונות'}</span>
        </Button>
      </div>

      {currentSeason && poolId && currentPool ? (
        <PoolProductSummaryCards
          registrationsCount={summaryData.registrationsCount}
          totalExpected={summaryData.totalExpected}
          totalPaid={summaryData.totalPaid}
        />
      ) : currentSeason && (
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
        currentPool={currentPool}
        onCreateProduct={handleCreateProduct}
        onUpdateProduct={handleUpdateProduct}
      />
    </div>
  );
};

export default ProductsPage;
