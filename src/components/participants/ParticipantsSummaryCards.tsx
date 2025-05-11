import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Product } from '@/types';
import { Users, DollarSign, BadgeDollarSign, Plus, Minus } from 'lucide-react';

interface ParticipantsSummaryCardsProps {
  product?: Product;
  activeCount?: number;
  inactiveCount?: number;
  totalExpectedPayment?: number;
  totalPaid?: number;
  isCalculating?: boolean;
  // Support for old props - keeping for backward compatibility
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
  isCalculating = false,
  totalParticipants,
  totalExpected,
  registrationsFilled
}) => {
  // Create stable memoized values to prevent flickering
  const memoizedValues = useMemo(() => {
    // Use either new or old props
    const totalCount = totalParticipants || (activeCount + inactiveCount);
    const expected = totalExpected || totalExpectedPayment;
    const filled = registrationsFilled || 
      (product?.maxParticipants ? Math.round((totalCount / product.maxParticipants) * 100) : 0);
    
    // Calculate difference between paid and expected
    const difference = totalPaid - expected;
    
    return {
      totalCount,
      expected,
      filled,
      difference
    };
  }, [
    totalParticipants, 
    activeCount, 
    inactiveCount, 
    totalExpected, 
    totalExpectedPayment, 
    totalPaid,
    product?.maxParticipants, 
    registrationsFilled
  ]);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4 flex flex-col items-center">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <div className="text-2xl font-bold">{memoizedValues.totalCount}</div>
          </div>
          <div className="text-sm text-gray-500">סה״כ רישומים</div>
          {product && (
            <div className="text-xs text-muted-foreground">
              מתוך {product.maxParticipants} מקומות ({memoizedValues.filled}%)
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 flex flex-col items-center">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            <div className="text-2xl font-bold">
              {memoizedValues.expected.toLocaleString('he-IL', { style: 'currency', currency: 'ILS' })}
            </div>
          </div>
          <div className="text-sm text-gray-500">סה״כ לתשלום (אחרי הנחות)</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 flex flex-col items-center">
          <div className="flex items-center gap-2">
            <BadgeDollarSign className="h-5 w-5 text-primary" />
            <div className="text-2xl font-bold">
              {totalPaid.toLocaleString('he-IL', { style: 'currency', currency: 'ILS' })}
            </div>
          </div>
          <div className="text-sm text-gray-500">סה״כ שולם</div>
          <div className="text-xs text-muted-foreground">
            (לפי סכום התשלומים בפועל)
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 flex flex-col items-center">
          <div className="flex items-center gap-2">
            {memoizedValues.difference >= 0 ? 
              <Plus className="h-5 w-5 text-green-600" /> : 
              <Minus className="h-5 w-5 text-red-600" />
            }
            <div className={`text-2xl font-bold ${memoizedValues.difference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {Math.abs(memoizedValues.difference).toLocaleString('he-IL', { style: 'currency', currency: 'ILS' })}
            </div>
          </div>
          <div className="text-sm text-gray-500">הפרש</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ParticipantsSummaryCards;
