
import React from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { calculateMeetingNumberForDate } from '@/utils/meetingCalculations';

interface Activity {
  product: {
    id: string;
    name: string;
    type: string;
    startDate: string;
    meetingsCount?: number;
    daysOfWeek?: string[];
  };
  startTime?: string;
  numParticipants: number;
}

interface ActivitiesTableProps {
  activities: Activity[];
  selectedDate: Date;
}

const ActivitiesTable: React.FC<ActivitiesTableProps> = ({
  activities,
  selectedDate,
}) => {
  if (activities.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg">
        <p className="text-lg text-gray-500">אין פעילויות ביום זה</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-right">שם הפעילות</TableHead>
            <TableHead className="text-right">שעת התחלה</TableHead>
            <TableHead className="text-right">מפגש מספר</TableHead>
            <TableHead className="text-right">מספר משתתפים</TableHead>
            <TableHead className="text-right">סוג</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {activities.map((activity, idx) => {
            // Calculate meeting number based on the selected date
            const meetingInfo = calculateMeetingNumberForDate(activity.product, selectedDate);
            
            return (
              <TableRow key={idx}>
                <TableCell className="font-medium text-right">{activity.product.name}</TableCell>
                <TableCell className="text-right">{activity.startTime || 'לא מוגדר'}</TableCell>
                <TableCell className="text-right">
                  {`${meetingInfo.current}/${meetingInfo.total}`}
                </TableCell>
                <TableCell className="text-right">{activity.numParticipants}</TableCell>
                <TableCell className="text-right">{activity.product.type}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default ActivitiesTable;
