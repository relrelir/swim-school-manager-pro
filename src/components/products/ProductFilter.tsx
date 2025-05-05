
import React from 'react';
import { Input } from '@/components/ui/input';

interface ProductFilterProps {
  filter: string;
  setFilter: (value: string) => void;
}

const ProductFilter: React.FC<ProductFilterProps> = ({ filter, setFilter }) => {
  return (
    <div className="mb-4">
      <Input
        placeholder="חיפוש לפי שם או סוג..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="max-w-sm"
      />
    </div>
  );
};

export default ProductFilter;
