
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Product } from '@/types';
import { formatPriceForUI } from '@/utils/formatters';
import { Users, DollarSign, BadgeDollarSign, Plus, Minus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface SeasonSummaryCardsProps {
  products: Product[];
  registrationsCount: number;
  totalExpected: number;
  totalPaid: number;
}

const SeasonSummaryCards: React.FC<SeasonSummaryCardsProps> = ({
  products,
  registrationsCount,
  totalExpected,
  totalPaid,
}) => {
  const { isAdmin } = useAuth();
  
  // Calculate the difference between paid and expected
  const difference = totalPaid - totalExpected;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4 flex flex-col items-center">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <div className="text-2xl font-bold">{registrationsCount}</div>
          </div>
          <div className="text-sm text-gray-500">סה"כ רישומים</div>
        </CardContent>
      </Card>
      
      {isAdmin() && (
        <>
          <Card>
            <CardContent className="p-4 flex flex-col items-center">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                <div className="text-2xl font-bold">
                  {formatPriceForUI(totalExpected)}
                </div>
              </div>
              <div className="text-sm text-gray-500">סה"כ לתשלום (אחרי הנחות)</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex flex-col items-center">
              <div className="flex items-center gap-2">
                <BadgeDollarSign className="h-5 w-5 text-primary" />
                <div className="text-2xl font-bold">
                  {formatPriceForUI(totalPaid)}
                </div>
              </div>
              <div className="text-sm text-gray-500">סה"כ שולם</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex flex-col items-center">
              <div className="flex items-center gap-2">
                {difference >= 0 ? 
                  <Plus className="h-5 w-5 text-green-600" /> : 
                  <Minus className="h-5 w-5 text-red-600" />
                }
                <div className={`text-2xl font-bold ${difference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPriceForUI(Math.abs(difference))}
                </div>
              </div>
              <div className="text-sm text-gray-500">הפרש</div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default SeasonSummaryCards;
