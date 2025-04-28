
import React, { createContext, useContext, useEffect } from 'react';
import { ProductsContextType } from './types';
import { useProducts } from '@/hooks/useProducts';

const ProductsContext = createContext<ProductsContextType | null>(null);

export const useProductsContext = () => {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error('useProductsContext must be used within a ProductsProvider');
  }
  return context;
};

export const ProductsProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const {
    products,
    fetchProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    getProductsBySeason,
    loading
  } = useProducts();

  // Load products when component mounts
  useEffect(() => {
    fetchProducts();
  }, []);

  const contextValue: ProductsContextType = {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    getProductsBySeason,
    loading
  };

  return (
    <ProductsContext.Provider value={contextValue}>
      {children}
    </ProductsContext.Provider>
  );
};
