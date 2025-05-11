
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
