
import React from 'react';
import { Table } from '@/components/ui/table';
import { Product } from '@/types';
import { useData } from '@/context/DataContext';
import ProductsTableHeader from './ProductsTableHeader';
import ProductsTableContent from './ProductsTableContent';

interface ProductsTableProps {
  products: Product[];
  sortField: keyof Product;
  sortDirection: 'asc' | 'desc';
  handleSort: (field: keyof Product) => void;
  onEditProduct: (product: Product) => void;
}

const ProductsTable: React.FC<ProductsTableProps> = ({ 
  products, 
  sortField, 
  sortDirection, 
  handleSort,
  onEditProduct
}) => {
  const { getRegistrationsByProduct } = useData();
  
  // Get participants count for a product
  const getParticipantsCount = (productId: string) => {
    const registrations = getRegistrationsByProduct(productId);
    return registrations.length;
  };

  return (
    <Table>
      <ProductsTableHeader 
        sortField={sortField} 
        sortDirection={sortDirection} 
        handleSort={handleSort} 
      />
      <ProductsTableContent 
        products={products} 
        getParticipantsCount={getParticipantsCount}
        onEditProduct={onEditProduct}
      />
    </Table>
  );
};

export default ProductsTable;
