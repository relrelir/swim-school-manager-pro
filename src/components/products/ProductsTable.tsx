
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Product } from '@/types';
import { format } from 'date-fns';
import { Edit } from 'lucide-react';

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
  const navigate = useNavigate();
  
  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch (e) {
      return dateString;
    }
  };

  // Format price with ILS symbol
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(price);
  };
  
  const goToParticipants = (productId: string) => {
    navigate(`/product/${productId}/participants`);
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="cursor-pointer" onClick={() => handleSort('name')}>
            שם {sortField === 'name' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
          </TableHead>
          <TableHead className="cursor-pointer" onClick={() => handleSort('type')}>
            סוג {sortField === 'type' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
          </TableHead>
          <TableHead className="cursor-pointer" onClick={() => handleSort('startDate')}>
            תאריך התחלה {sortField === 'startDate' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
          </TableHead>
          <TableHead className="cursor-pointer" onClick={() => handleSort('endDate')}>
            תאריך סיום {sortField === 'endDate' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
          </TableHead>
          <TableHead className="cursor-pointer" onClick={() => handleSort('price')}>
            מחיר {sortField === 'price' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
          </TableHead>
          <TableHead className="cursor-pointer" onClick={() => handleSort('maxParticipants')}>
            מקסימום משתתפים {sortField === 'maxParticipants' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
          </TableHead>
          <TableHead>ימים</TableHead>
          <TableHead>שעת התחלה</TableHead>
          <TableHead>פעולות</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => (
          <TableRow key={product.id}>
            <TableCell className="font-medium">{product.name}</TableCell>
            <TableCell>{product.type}</TableCell>
            <TableCell>{formatDate(product.startDate)}</TableCell>
            <TableCell>{formatDate(product.endDate)}</TableCell>
            <TableCell>{formatPrice(product.price)}</TableCell>
            <TableCell>{product.maxParticipants}</TableCell>
            <TableCell>{product.daysOfWeek?.join(', ') || '-'}</TableCell>
            <TableCell>{product.startTime || '-'}</TableCell>
            <TableCell>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => goToParticipants(product.id)}>
                  צפה במשתתפים
                </Button>
                <Button variant="outline" size="sm" onClick={() => onEditProduct(product)}>
                  <Edit className="h-4 w-4 ml-1" />
                  ערוך
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ProductsTable;
