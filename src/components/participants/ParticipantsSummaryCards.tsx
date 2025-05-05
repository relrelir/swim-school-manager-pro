
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Product } from '@/types';
import { formatPriceForUI } from '@/utils/formatters';

interface ParticipantsSummaryCardsProps {
  totalParticipants: number;
  product: Product | undefined;
  totalExpected: number; // This should be effectiveRequired (after discounts)
  totalPaid: number;     // This should be actual payments
  registrationsFilled: number;
}

const ParticipantsSummaryCards: React.FC<ParticipantsSummaryCardsProps> = ({
  totalParticipants,
  product,
  totalExpected,
  totalPaid,
  registrationsFilled,
}) => {
  // Calculate the difference between paid and expected (considering discounts)
  const difference = totalPaid - totalExpected;
  
  // Create a simplified occupancy text - just "X מתוך Y"
  const occupancyText = product 
    ? `${totalParticipants} מתוך ${product.maxParticipants}`
    : `${totalParticipants}`;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4 flex flex-col items-center">
          <div className="text-2xl font-bold text-center">
            {occupancyText}
          </div>
          <div className="text-sm text-gray-500">מקומות תפוסים</div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
            <div
              className="bg-primary h-2.5 rounded-full"
              style={{ width: `${Math.min(registrationsFilled, 100)}%` }}
            ></div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 flex flex-col items-center">
          <div className="text-2xl font-bold">
            {formatPriceForUI(totalExpected)}
          </div>
          <div className="text-sm text-gray-500">סכום לתשלום (אחרי הנחות)</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 flex flex-col items-center">
          <div className="text-2xl font-bold">
            {formatPriceForUI(totalPaid)}
          </div>
          <div className="text-sm text-gray-500">סכום ששולם</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 flex flex-col items-center">
          <div className={`text-2xl font-bold ${difference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatPriceForUI(difference)}
          </div>
          <div className="text-sm text-gray-500">הפרש</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ParticipantsSummaryCards;
