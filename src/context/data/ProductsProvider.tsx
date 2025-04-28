
import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from "@/components/ui/use-toast";
import { Product } from '@/types';
import { ProductsContextType } from './types';
import { generateId, handleSupabaseError } from './utils';
import { supabase } from '@/integrations/supabase/client';

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

        // Transform data to match our Product type
        const transformedProducts: Product[] = data?.map(product => ({
          id: product.id,
          name: product.name,
          type: product.description || 'קורס',
          price: Number(product.price),
          seasonId: product.seasonId,
          startDate: product.startDate,
          endDate: product.endDate,
          maxParticipants: product.maxParticipants || 20,
          notes: product.instructor || '',
          startTime: product.startTime,
          daysOfWeek: product.daysOfWeek || []
        })) || [];

        setProducts(transformedProducts);
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

  // Products functions
  const addProduct = async (product: Omit<Product, 'id'>) => {
    try {
      // Transform product to match our database schema
      const dbProduct = {
        name: product.name,
        description: product.type,
        price: product.price,
        seasonId: product.seasonId,
        startDate: product.startDate,
        endDate: product.endDate,
        startTime: product.startTime,
        daysOfWeek: product.daysOfWeek,
        maxParticipants: product.maxParticipants,
        instructor: product.notes
      };

      const { data, error } = await supabase
        .from('products')
        .insert([dbProduct])
        .select()
        .single();

      if (error) {
        handleSupabaseError(error, 'adding product');
      }

      if (data) {
        const newProduct: Product = {
          id: data.id,
          name: data.name,
          type: data.description || 'קורס',
          price: Number(data.price),
          seasonId: data.seasonId,
          startDate: data.startDate,
          endDate: data.endDate,
          maxParticipants: data.maxParticipants || 20,
          notes: data.instructor || '',
          startTime: data.startTime,
          daysOfWeek: data.daysOfWeek || []
        };
        setProducts([...products, newProduct]);
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

  const updateProduct = async (product: Product) => {
    try {
      // Transform product to match our database schema
      const dbProduct = {
        name: product.name,
        description: product.type,
        price: product.price,
        seasonId: product.seasonId,
        startDate: product.startDate,
        endDate: product.endDate,
        startTime: product.startTime,
        daysOfWeek: product.daysOfWeek,
        maxParticipants: product.maxParticipants,
        instructor: product.notes
      };

      const { error } = await supabase
        .from('products')
        .update(dbProduct)
        .eq('id', product.id);

      if (error) {
        handleSupabaseError(error, 'updating product');
      }

      setProducts(products.map(p => p.id === product.id ? product : p));
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בעדכון מוצר",
        variant: "destructive",
      });
    }
  };

  const deleteProduct = async (id: string) => {
    try {
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
