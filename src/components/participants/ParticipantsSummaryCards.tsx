
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Product } from '@/types';

interface ParticipantsSummaryCardsProps {
  totalParticipants: number;
  product: Product | undefined;
  totalExpected: number;
  totalPaid: number;
  registrationsFilled: number;
}

const ParticipantsSummaryCards: React.FC<ParticipantsSummaryCardsProps> = ({
  totalParticipants,
  product,
  totalExpected,
  totalPaid,
  registrationsFilled,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4 flex flex-col items-center">
          <div className="text-2xl font-bold">
            {totalParticipants} / {product?.maxParticipants || 0}
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
            {Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(totalExpected)}
          </div>
          <div className="text-sm text-gray-500">סכום לתשלום</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 flex flex-col items-center">
          <div className="text-2xl font-bold">
            {Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(totalPaid)}
          </div>
          <div className="text-sm text-gray-500">סכום ששולם</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 flex flex-col items-center">
          <div className="text-2xl font-bold">
            {Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(totalPaid - totalExpected)}
          </div>
          <div className="text-sm text-gray-500">הפרש</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ParticipantsSummaryCards;
