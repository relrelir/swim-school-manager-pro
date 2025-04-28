
import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from "@/components/ui/use-toast";
import { Product } from '@/types';
import { ProductsContextType } from './types';
import { generateId, loadData, saveData } from './utils';

const ProductsContext = createContext<ProductsContextType | null>(null);

export const useProductsContext = () => {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error('useProductsContext must be used within a ProductsProvider');
  }
  return context;
};

export const ProductsProvider: React.FC<{ children: React.ReactNode; registrations?: any[] }> = ({ 
  children, 
  registrations = [] 
}) => {
  const [products, setProducts] = useState<Product[]>(() => loadData('swimSchoolProducts', []));

  // Save data to localStorage whenever it changes
  useEffect(() => {
    saveData('swimSchoolProducts', products);
  }, [products]);

  // Products functions
  const addProduct = (product: Omit<Product, 'id'>) => {
    const newProduct = { ...product, id: generateId() };
    setProducts([...products, newProduct]);
  };

  const updateProduct = (product: Product) => {
    setProducts(products.map(p => p.id === product.id ? product : p));
  };

  const deleteProduct = (id: string) => {
    // Check if product has registrations
    const hasRegistrations = registrations.some(registration => registration.productId === id);
    if (hasRegistrations) {
      toast({
        title: "שגיאה",
        description: "לא ניתן למחוק מוצר שיש לו רישומי משתתפים",
        variant: "destructive",
      });
      return;
    }
    setProducts(products.filter(p => p.id !== id));
  };

  const getProductsBySeason = (seasonId: string) => {
    return products.filter(product => product.seasonId === seasonId);
  };

  const contextValue: ProductsContextType = {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    getProductsBySeason,
  };

  return (
    <ProductsContext.Provider value={contextValue}>
      {children}
    </ProductsContext.Provider>
  );
};
