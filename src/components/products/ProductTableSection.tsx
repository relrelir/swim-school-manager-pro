import React from 'react';
import { Product } from '@/types';
import ProductsTable from './ProductsTable';
import EmptyProductsState from './EmptyProductsState';

interface ProductTableSectionProps {
  products: Product[];
  sortField: keyof Product;
  sortDirection: 'asc' | 'desc';
  handleSort: (field: keyof Product) => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (product: Product) => void; // חדש
}

const ProductTableSection: React.FC<ProductTableSectionProps> = ({
  products,
  sortField,
  sortDirection,
  handleSort,
  onEditProduct,
  onDeleteProduct // חדש
}) => {
  return (
    <div className="overflow-x-auto">
      {products.length === 0 ? (
        <EmptyProductsState />
      ) : (
        <ProductsTable 
          products={products} 
          sortField={sortField} 
          sortDirection={sortDirection} 
          handleSort={handleSort}
          onEditProduct={onEditProduct}
          onDeleteProduct={onDeleteProduct} // חדש
        />
      )}
    </div>
  );
};
