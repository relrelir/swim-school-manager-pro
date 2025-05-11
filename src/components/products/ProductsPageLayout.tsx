
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { Product, Season, Pool } from '@/types';
import ProductBreadcrumbs from './ProductBreadcrumbs';
import ProductPageHeader from './ProductPageHeader';
import SeasonSummaryCards from '@/components/seasons/SeasonSummaryCards';
import PoolProductSummaryCards from '@/components/pools/PoolProductSummaryCards';
import ProductFilter from './ProductFilter';
import ProductTableSection from './ProductTableSection';
import ProductDialogs from './ProductDialogs';

interface ProductsPageLayoutProps {
  seasonId?: string;
  poolId?: string;
  currentSeason?: Season;
  currentPool?: Pool;
  isMobile: boolean;
  products: Product[];
  summaryData: {
    registrationsCount: number;
    totalExpected: number;
    totalPaid: number;
  };
  filter: string;
  setFilter: (value: string) => void;
  sortField: keyof Product;
  sortDirection: 'asc' | 'desc';
  handleSort: (field: keyof Product) => void;
  filteredAndSortedProducts: Product[];
  isAddProductOpen: boolean;
  setIsAddProductOpen: (open: boolean) => void;
  isEditProductOpen: boolean;
  setIsEditProductOpen: (open: boolean) => void;
  editingProduct: Product | null;
  formatDate: (date: string) => string;
  onBackNavigation: () => void;
  onAddProduct: () => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (product: Product) => void;
  onCreateProduct: (product: Omit<Product, 'id'>) => void;
  onUpdateProduct: (product: Partial<Product>) => void;
}

const ProductsPageLayout: React.FC<ProductsPageLayoutProps> = ({
  seasonId,
  poolId,
  currentSeason,
  currentPool,
  isMobile,
  products,
  summaryData,
  filter,
  setFilter,
  sortField,
  sortDirection,
  handleSort,
  filteredAndSortedProducts,
  isAddProductOpen,
  setIsAddProductOpen,
  isEditProductOpen,
  setIsEditProductOpen,
  editingProduct,
  formatDate,
  onBackNavigation,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onCreateProduct,
  onUpdateProduct
}) => {
  return (
    <div className="container mx-auto">
      <div className="mb-4">
        <ProductBreadcrumbs 
          seasonId={seasonId} 
          currentSeason={currentSeason} 
          currentPool={currentPool} 
        />
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <ProductPageHeader 
          currentSeason={currentSeason}
          currentPool={currentPool} 
          formatDate={formatDate}
          onAddProduct={onAddProduct} 
        />
        
        <Button variant="outline" onClick={onBackNavigation} className="flex items-center gap-2">
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
          products={products}
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
        onEditProduct={onEditProduct}
        onDeleteProduct={onDeleteProduct}
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
        onCreateProduct={onCreateProduct}
        onUpdateProduct={onUpdateProduct}
      />
    </div>
  );
};

export default ProductsPageLayout;
