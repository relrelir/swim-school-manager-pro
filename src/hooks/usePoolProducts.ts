
import { useState, useEffect } from 'react';
import { useData } from '@/context/DataContext';
import { Product, Pool } from '@/types';

export function usePoolProducts(poolId: string | undefined) {
  const { products, getProductsByPool } = useData();
  const [poolProducts, setPoolProducts] = useState<Product[]>([]);
  
  useEffect(() => {
    if (poolId) {
      const productsInPool = getProductsByPool(poolId);
      setPoolProducts(productsInPool);
    } else {
      setPoolProducts([]);
    }
  }, [poolId, products, getProductsByPool]);

  return { poolProducts };
}
