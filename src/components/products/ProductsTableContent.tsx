
import React from 'react';
import { TableBody, TableRow, TableCell } from '@/components/ui/table';
import { Product } from '@/types';
import { formatDateForUI, formatPriceForUI, formatTimeForUI, formatParticipantsCountForUI, formatMeetingCountForUI } from '@/utils/formatters';
import { calculateCurrentMeeting } from '@/context/data/utils';
import ProductsTableActions from './ProductsTableActions';

interface ProductsTableContentProps {
  products: Product[];
  getParticipantsCount: (productId: string) => number;
  onEditProduct: (product: Product) => void;
}

const ProductsTableContent: React.FC<ProductsTableContentProps> = ({ 
  products,
  getParticipantsCount,
  onEditProduct
}) => {
  return (
    <TableBody>
      {products.map((product) => {
        const { current, total } = calculateCurrentMeeting(product);
        
        return (
          <TableRow key={product.id}>
            <TableCell className="font-medium">{product.name}</TableCell>
            <TableCell>{product.type}</TableCell>
            <TableCell>{formatDateForUI(product.startDate)}</TableCell>
            <TableCell>{formatDateForUI(product.endDate)}</TableCell>
            <TableCell>{formatPriceForUI(product.price)}</TableCell>
            <TableCell>{formatParticipantsCountForUI(getParticipantsCount(product.id), product.maxParticipants)}</TableCell>
            <TableCell>{product.daysOfWeek?.join(', ') || '-'}</TableCell>
            <TableCell>{formatTimeForUI(product.startTime)}</TableCell>
            <TableCell>{formatMeetingCountForUI(current, total)}</TableCell>
            <TableCell>
              <ProductsTableActions 
                product={product} 
                onEditProduct={onEditProduct}
              />
            </TableCell>
          </TableRow>
        );
      })}
    </TableBody>
  );
};

export default ProductsTableContent;
