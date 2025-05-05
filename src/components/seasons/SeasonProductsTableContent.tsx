
import React from 'react';
import { TableBody, TableRow, TableCell } from "@/components/ui/table";
import { Product } from '@/types';
import { formatDate, formatPriceForUI, formatTime, formatParticipantsCount } from '@/utils/formatters';
import SeasonProductsTableActions from './SeasonProductsTableActions';

interface SeasonProductsTableContentProps {
  products: Product[];
  getProductMeetingInfo: (product: Product) => { current: number; total: number };
  getParticipantsCount: (productId: string) => number;
  onEditProduct: (product: Product) => void;
}

const SeasonProductsTableContent: React.FC<SeasonProductsTableContentProps> = ({
  products,
  getProductMeetingInfo,
  getParticipantsCount,
  onEditProduct
}) => {
  // Format meeting count as XX/XX
  const formatMeetingCount = (product: Product) => {
    const meetingInfo = getProductMeetingInfo(product);
    return `${meetingInfo.current}/${meetingInfo.total}`;
  };

  // Calculate effective price after discount
  const getEffectivePrice = (product: Product) => {
    const discountAmount = product.discountAmount || 0;
    return Math.max(0, product.price - discountAmount);
  };

  return (
    <TableBody>
      {products.map((product) => {
        const effectivePrice = getEffectivePrice(product);
        return (
          <TableRow key={product.id}>
            <TableCell className="font-medium">{product.name}</TableCell>
            <TableCell>{product.type}</TableCell>
            <TableCell>
              {formatPriceForUI(product.price)}
              {product.discountAmount && product.discountAmount > 0 && (
                <div className="text-sm text-green-600">
                  {formatPriceForUI(effectivePrice)} (אחרי הנחה)
                </div>
              )}
            </TableCell>
            <TableCell>{formatDate(product.startDate)}</TableCell>
            <TableCell>{formatDate(product.endDate)}</TableCell>
            <TableCell>{product.daysOfWeek?.join(', ') || '-'}</TableCell>
            <TableCell>{formatTime(product.startTime)}</TableCell>
            <TableCell>{formatMeetingCount(product)}</TableCell>
            <TableCell>
              {formatParticipantsCount(getParticipantsCount(product.id), product.maxParticipants)}
            </TableCell>
            <TableCell>
              <SeasonProductsTableActions 
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

export default SeasonProductsTableContent;
