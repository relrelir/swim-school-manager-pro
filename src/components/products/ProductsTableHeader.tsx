
import React from 'react';
import { TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Product } from '@/types';

interface ProductsTableHeaderProps {
  sortField: keyof Product;
  sortDirection: 'asc' | 'desc';
  handleSort: (field: keyof Product) => void;
}

const ProductsTableHeader: React.FC<ProductsTableHeaderProps> = ({ 
  sortField, 
  sortDirection, 
  handleSort 
}) => {
  const getSortIndicator = (field: keyof Product) => {
    return sortField === field ? (sortDirection === 'asc' ? '▲' : '▼') : '';
  };

  return (
    <TableHeader>
      <TableRow>
        <TableHead className="cursor-pointer" onClick={() => handleSort('name')}>
          שם {getSortIndicator('name')}
        </TableHead>
        <TableHead className="cursor-pointer" onClick={() => handleSort('type')}>
          סוג {getSortIndicator('type')}
        </TableHead>
        <TableHead className="cursor-pointer" onClick={() => handleSort('startDate')}>
          תאריך התחלה {getSortIndicator('startDate')}
        </TableHead>
        <TableHead className="cursor-pointer" onClick={() => handleSort('endDate')}>
          תאריך סיום {getSortIndicator('endDate')}
        </TableHead>
        <TableHead className="cursor-pointer" onClick={() => handleSort('price')}>
          מחיר {getSortIndicator('price')}
        </TableHead>
        <TableHead className="cursor-pointer" onClick={() => handleSort('maxParticipants')}>
          משתתפים {getSortIndicator('maxParticipants')}
        </TableHead>
        <TableHead>ימים</TableHead>
        <TableHead>שעת התחלה</TableHead>
        <TableHead>מפגש</TableHead>
        <TableHead>פעולות</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default ProductsTableHeader;
