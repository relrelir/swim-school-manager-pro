
import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from "@/components/ui/use-toast";
import { Product } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { handleSupabaseError, mapProductFromDB, mapProductToDB } from './utils';
import { ProductsContextType } from './types';

// Create a context for products data
const ProductsContext = createContext<ProductsContextType | null>(null);

export const useProductsContext = () => {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error('useProductsContext must be used within a ProductsProvider');
  }
  return context;
};

export const ProductsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Load products from Supabase
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*');

        if (error) {
          handleSupabaseError(error, 'fetching products');
        }

        if (data) {
          // Transform data to match our Product type with proper casing
          const transformedProducts = data.map(product => {
            // Map DB fields to our model properties (handle casing differences)
            const mappedProduct = mapProductFromDB(product);
            return mappedProduct;
          });
          
          setProducts(transformedProducts);
        }
      } catch (error) {
        console.error('Error loading products:', error);
        toast({
          title: "שגיאה",
          description: "אירעה שגיאה בטעינת מוצרים",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Add a product
  const addProduct = async (product: Omit<Product, 'id'>) => {
    try {
      // Convert to DB field names format (lowercase)
      const dbProduct = mapProductToDB(product);
      
      const { data, error } = await supabase
        .from('products')
        .insert([dbProduct])
        .select()
        .single();

      if (error) {
        handleSupabaseError(error, 'adding product');
      }

      if (data) {
        // Convert back to our TypeScript model format (camelCase)
        const newProduct = mapProductFromDB(data);
        setProducts([...products, newProduct]);
        return newProduct;
      }
    } catch (error) {
      console.error('Error adding product:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בהוספת מוצר חדש",
        variant: "destructive",
      });
    }
  };

  // Update a product
  const updateProduct = async (product: Product) => {
    try {
      // Convert to DB field names format (lowercase)
      const { id, ...productData } = product;
      const dbProduct = mapProductToDB(productData);
      
      const { error } = await supabase
        .from('products')
        .update(dbProduct)
        .eq('id', id);

      if (error) {
        handleSupabaseError(error, 'updating product');
      }

      setProducts(products.map(p => p.id === id ? product : p));
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בעדכון מוצר",
        variant: "destructive",
      });
    }
  };

  // Delete a product
  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        handleSupabaseError(error, 'deleting product');
      }

      setProducts(products.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה במחיקת מוצר",
        variant: "destructive",
      });
    }
  };

  // Get products by season
  const getProductsBySeason = (seasonId: string) => {
    return products.filter(product => product.seasonId === seasonId);
  };

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
