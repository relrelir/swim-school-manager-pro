
import { useState, useEffect } from 'react';
import { Product } from '@/types';
import { useProductsContext } from '@/context/data/ProductsProvider';

export const useProducts = () => {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    getProductsBySeason,
    getProductsByPool,
    loading
  } = useProductsContext();

  return {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    getProductsBySeason,
    getProductsByPool,
    loading
  };
};
