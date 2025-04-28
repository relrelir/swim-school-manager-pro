
import React, { createContext, useContext, useEffect, useState } from 'react';
import { ProductsContextType } from './types';
import { Product } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/use-toast";
import { mapProductFromDB, mapProductToDB } from './utils';

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

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*');

      if (error) {
        throw error;
      }

      // Map database fields to our model (camelCase)
      const mappedProducts: Product[] = data.map(item => {
        return mapProductFromDB({
          ...item,
          meetingscount: item.meetingscount || 10
        });
      });

      setProducts(mappedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: 'שגיאה',
        description: 'אירעה שגיאה בטעינת המוצרים',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Add a new product
  const addProduct = async (product: Omit<Product, 'id'>): Promise<Product | undefined> => {
    try {
      // Map our model to database fields (snake_case)
      const { data, error } = await supabase
        .from('products')
        .insert(mapProductToDB(product))
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Map the returned data to our model
      const newProduct: Product = mapProductFromDB({
        ...data,
        meetingscount: data.meetingscount || 10
      });

      // Update state
      setProducts(prevProducts => [...prevProducts, newProduct]);
      
      toast({
        title: 'מוצר נוסף',
        description: `המוצר ${product.name} נוסף בהצלחה`,
      });
      
      return newProduct;
    } catch (error) {
      console.error('Error adding product:', error);
      toast({
        title: 'שגיאה',
        description: 'אירעה שגיאה בהוספת המוצר',
        variant: 'destructive',
      });
      return undefined;
    }
  };

  // Update a product
  const updateProduct = async (product: Product): Promise<void> => {
    try {
      const { error } = await supabase
        .from('products')
        .update(mapProductToDB(product))
        .eq('id', product.id);

      if (error) {
        throw error;
      }

      // Update state
      setProducts(prevProducts =>
        prevProducts.map(p => (p.id === product.id ? product : p))
      );
      
      toast({
        title: 'מוצר עודכן',
        description: `המוצר ${product.name} עודכן בהצלחה`,
      });
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: 'שגיאה',
        description: 'אירעה שגיאה בעדכון המוצר',
        variant: 'destructive',
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
        throw error;
      }

      // Update state
      setProducts(prevProducts => prevProducts.filter(p => p.id !== id));
      
      toast({
        title: 'מוצר נמחק',
        description: 'המוצר נמחק בהצלחה',
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: 'שגיאה',
        description: 'אירעה שגיאה במחיקת המוצר',
        variant: 'destructive',
      });
    }
  };

  // Filter products by season
  const getProductsBySeason = (seasonId: string): Product[] => {
    return products.filter(product => product.seasonId === seasonId);
  };

  return (
    <ProductsContext.Provider
      value={{
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        getProductsBySeason,
        loading,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
};
