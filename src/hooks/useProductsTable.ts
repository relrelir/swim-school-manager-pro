
import { useState, useMemo } from 'react';
import { Product } from '@/types';

interface UseProductsTableProps {
  products: Product[];
}

export function useProductsTable({ products }: UseProductsTableProps) {
  // Sorting state
  const [sortField, setSortField] = useState<keyof Product>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filter, setFilter] = useState('');

  // Handle sorting
  const handleSort = (field: keyof Product) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    return products
      .filter(product => 
        filter === '' || 
        product.name.toLowerCase().includes(filter.toLowerCase()) ||
        product.type.toLowerCase().includes(filter.toLowerCase())
      )
      .sort((a, b) => {
        let valA: any = a[sortField];
        let valB: any = b[sortField];
        
        if (typeof valA === 'string' && typeof valB === 'string') {
          valA = valA.toLowerCase();
          valB = valB.toLowerCase();
        }
        
        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
  }, [products, filter, sortField, sortDirection]);

  return {
    filter,
    setFilter,
    sortField,
    sortDirection,
    handleSort,
    filteredAndSortedProducts
  };
}
