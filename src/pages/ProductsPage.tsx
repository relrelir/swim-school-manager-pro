
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useData } from '@/context/DataContext';
import { Product } from '@/types';
import { useProductsTable } from '@/hooks/useProductsTable';

// Import newly created components
import AddProductForm from '@/components/products/AddProductForm';
import EditProductDialog from '@/components/products/EditProductDialog';
import ProductsTable from '@/components/products/ProductsTable';
import EmptyProductsState from '@/components/products/EmptyProductsState';

const ProductsPage: React.FC = () => {
  const { seasonId } = useParams<{ seasonId: string }>();
  const navigate = useNavigate();
  const { seasons, products, addProduct, getProductsBySeason, updateProduct } = useData();
  
  const [currentSeason, setCurrentSeason] = useState(seasons.find(s => s.id === seasonId));
  const [seasonProducts, setSeasonProducts] = useState<Product[]>([]);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Use our custom hook for filtering and sorting
  const { 
    filter, 
    setFilter, 
    sortField, 
    sortDirection, 
    handleSort, 
    filteredAndSortedProducts 
  } = useProductsTable({ products: seasonProducts });
  
  useEffect(() => {
    if (seasonId) {
      const season = seasons.find(s => s.id === seasonId);
      setCurrentSeason(season);
      
      const products = getProductsBySeason(seasonId);
      setSeasonProducts(products);
    }
  }, [seasonId, seasons, getProductsBySeason]);

  const handleCreateProduct = (product: Omit<Product, 'id'>) => {
    addProduct(product);
    setIsAddProductOpen(false);
    // Refresh products list
    setSeasonProducts(getProductsBySeason(seasonId || ''));
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
      setSeasonProducts(getProductsBySeason(seasonId || ''));
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return dateString;
    }
  };
  
  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Button variant="outline" onClick={() => navigate('/')}>חזרה לעונות</Button>
          <h1 className="text-2xl font-bold mt-2">
            {currentSeason ? `מוצרים בעונת ${currentSeason.name}` : 'מוצרים'}
          </h1>
          {currentSeason && (
            <p className="text-gray-600">
              {`${formatDate(currentSeason.startDate)} - ${formatDate(currentSeason.endDate)}`}
            </p>
          )}
        </div>
        <Button onClick={() => setIsAddProductOpen(true)}>
          הוסף מוצר חדש
        </Button>
      </div>
      
      {/* Search and Filter */}
      <div className="mb-4">
        <Input
          placeholder="חיפוש לפי שם או סוג..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Products Table or Empty State */}
      <div className="overflow-x-auto">
        {filteredAndSortedProducts.length === 0 ? (
          <EmptyProductsState />
        ) : (
          <ProductsTable 
            products={filteredAndSortedProducts} 
            sortField={sortField} 
            sortDirection={sortDirection} 
            handleSort={handleSort}
            onEditProduct={handleEditProduct}
          />
        )}
      </div>

      {/* Add Product Dialog */}
      <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>הוסף מוצר חדש</DialogTitle>
          </DialogHeader>
          <AddProductForm 
            onSubmit={handleCreateProduct} 
            currentSeason={currentSeason}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={isEditProductOpen} onOpenChange={setIsEditProductOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>עריכת מוצר</DialogTitle>
          </DialogHeader>
          {editingProduct && (
            <EditProductDialog
              isOpen={isEditProductOpen}
              onOpenChange={setIsEditProductOpen}
              product={editingProduct}
              onSubmit={handleUpdateProduct}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductsPage;
