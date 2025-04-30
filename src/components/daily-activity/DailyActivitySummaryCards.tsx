
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

interface DailyActivitySummaryCardsProps {
  selectedDate: Date;
  activitiesCount: number;
  participantsCount: number;
}

const DailyActivitySummaryCards: React.FC<DailyActivitySummaryCardsProps> = ({
  selectedDate,
  activitiesCount,
  participantsCount,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card>
        <CardContent className="p-4 flex flex-col items-center">
          <div className="text-2xl font-bold">
            {format(selectedDate, 'EEEE', { locale: he })}
          </div>
          <div className="text-sm text-gray-500">יום בשבוע</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 flex flex-col items-center">
          <div className="text-2xl font-bold">{activitiesCount}</div>
          <div className="text-sm text-gray-500">פעילויות</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 flex flex-col items-center">
          <div className="text-2xl font-bold">{participantsCount}</div>
          <div className="text-sm text-gray-500">משתתפים</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DailyActivitySummaryCards;
