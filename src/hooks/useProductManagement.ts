
import { useState } from 'react';
import { Product, Pool } from '@/types';
import { useData } from '@/context/DataContext';
import { toast } from '@/components/ui/use-toast';

export function useProductManagement({ 
  seasonId, 
  poolId, 
  setSeasonProducts 
}: { 
  seasonId?: string; 
  poolId?: string;
  setSeasonProducts: (products: Product[]) => void;
}) {
  const { 
    addProduct, 
    updateProduct, 
    deleteProduct, 
    getProductsBySeason, 
    getProductsByPool,
    getRegistrationsByProduct
  } = useData();

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
    refreshProducts();
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
      
      // Refresh products list
      refreshProducts();
    }
  };
  
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
        refreshProducts();
      });
    }
  };
  
  const refreshProducts = () => {
    if (poolId) {
      setSeasonProducts(getProductsByPool(poolId));
    } else if (seasonId) {
      setSeasonProducts(getProductsBySeason(seasonId));
    }
  };

  return {
    isAddProductOpen,
    setIsAddProductOpen,
    isEditProductOpen,
    setIsEditProductOpen,
    editingProduct,
    handleCreateProduct,
    handleEditProduct,
    handleUpdateProduct,
    handleDeleteProduct
  };
}
