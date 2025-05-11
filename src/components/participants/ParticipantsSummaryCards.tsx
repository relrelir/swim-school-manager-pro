
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Product } from '@/types';

interface ParticipantsSummaryCardsProps {
  product?: Product;
  // Support both new and old prop patterns
  activeCount?: number;
  inactiveCount?: number;
  totalExpectedPayment?: number;
  totalPaid?: number;
  // Old props
  totalParticipants?: number;
  totalExpected?: number;
  registrationsFilled?: number;
}

const ParticipantsSummaryCards: React.FC<ParticipantsSummaryCardsProps> = ({
  product,
  activeCount = 0,
  inactiveCount = 0,
  totalExpectedPayment = 0,
  totalPaid = 0,
  totalParticipants,
  totalExpected,
  registrationsFilled
}) => {
  // Use either new or old props
  const totalCount = totalParticipants || (activeCount + inactiveCount);
  const expected = totalExpected || totalExpectedPayment;
  const filled = registrationsFilled || (product?.maxParticipants ? Math.round((totalCount / product.maxParticipants) * 100) : 0);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">סה״כ משתתפים</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{totalCount}</div>
          {product && (
            <div className="text-xs text-muted-foreground">
              מתוך {product.maxParticipants} מקומות ({filled}%)
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">משתתפים פעילים</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-600">{activeCount}</div>
          <div className="text-xs text-muted-foreground">
            עם הצהרת בריאות תקפה
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">סה״כ לתשלום</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {expected.toLocaleString('he-IL', { style: 'currency', currency: 'ILS' })}
          </div>
          <div className="text-xs text-muted-foreground">
            הסכום הכולל לגבייה
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">סה״כ שולם</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {totalPaid.toLocaleString('he-IL', { style: 'currency', currency: 'ILS' })}
          </div>
          <div className="text-xs text-muted-foreground">
            {totalPaid < expected ? 'נותר לגבייה: ' + (expected - totalPaid).toLocaleString('he-IL', { style: 'currency', currency: 'ILS' }) : 'הסכום שולם במלואו'}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ParticipantsSummaryCards;
