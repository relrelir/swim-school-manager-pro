
import React, { useState } from 'react';
import { useData } from '@/context/DataContext';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { exportDailyActivitiesToCSV } from '@/utils/exportUtils';

const DailyActivityPage: React.FC = () => {
  const { getDailyActivities } = useData();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Convert the date to a string format for the getDailyActivities function
  const dateString = format(selectedDate, 'yyyy-MM-dd');
  const activities = getDailyActivities(dateString);

  const handleExport = () => {
    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
    exportDailyActivitiesToCSV(activities, formattedDate);
  };

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">פעילות יומית</h1>
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal",
                )}
              >
                <CalendarIcon className="ml-2 h-4 w-4" />
                {format(selectedDate, "d בMMMM yyyy", { locale: he })}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                weekStartsOn={0}
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
          <Button variant="outline" onClick={handleExport}>ייצוא לאקסל</Button>
        </div>
      </div>

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
            <div className="text-2xl font-bold">{activities.length}</div>
            <div className="text-sm text-gray-500">פעילויות</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center">
            <div className="text-2xl font-bold">
              {activities.reduce((sum, activity) => sum + activity.numParticipants, 0)}
            </div>
            <div className="text-sm text-gray-500">משתתפים</div>
          </CardContent>
        </Card>
      </div>

      {activities.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>שם הפעילות</TableHead>
              <TableHead>שעת התחלה</TableHead>
              <TableHead>מפגש מספר</TableHead>
              <TableHead>מספר משתתפים</TableHead>
              <TableHead>סוג</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activities.map((activity, idx) => (
              <TableRow key={idx}>
                <TableCell className="font-medium">{activity.product.name}</TableCell>
                <TableCell>{activity.startTime || 'לא מוגדר'}</TableCell>
                <TableCell>
                  {activity.currentMeetingNumber && activity.totalMeetings 
                    ? `${activity.currentMeetingNumber}/${activity.totalMeetings}`
                    : 'לא מוגדר'}
                </TableCell>
                <TableCell>{activity.numParticipants}</TableCell>
                <TableCell>{activity.product.type}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <p className="text-lg text-gray-500">אין פעילויות ביום זה</p>
        </div>
      )}
    </div>
  );
};

export default DailyActivityPage;
