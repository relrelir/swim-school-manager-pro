
import React, { useState } from 'react';
import { useData } from '@/context/DataContext';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { format, parse, isValid } from 'date-fns';
import { he } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { exportDailyActivitiesToCSV } from '@/utils/exportUtils';

const DailyActivityPage: React.FC = () => {
  const { getDailyActivities, calculateMeetingProgress } = useData();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dateInputValue, setDateInputValue] = useState<string>(format(new Date(), 'yyyy-MM-dd'));

  // Handle date input change
  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDateInputValue(value);
    
    // Parse the date if valid
    const parsedDate = parse(value, 'yyyy-MM-dd', new Date());
    if (isValid(parsedDate)) {
      setSelectedDate(parsedDate);
    }
  };

  // Convert the date to a string format for the getDailyActivities function
  const dateString = format(selectedDate, 'yyyy-MM-dd');
  const activities = getDailyActivities(dateString);

  // Calculate the current meeting number based on the selected date
  const calculateMeetingNumberForDate = (product: any, selectedDate: Date) => {
    const startDate = new Date(product.startDate);
    const today = new Date(selectedDate);
    
    if (today < startDate) return { current: 0, total: product.meetingsCount || 10 };
    
    const daysInWeekForProduct = product.daysOfWeek?.length || 1;
    const daysDiff = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Calculate how many meeting days based on days difference and meeting frequency
    const weeksPassed = Math.floor(daysDiff / 7);
    const meetingsPassed = (weeksPassed * daysInWeekForProduct) + 1; // +1 for the first meeting
    
    // Make sure we don't exceed total meetings
    const currentMeeting = Math.min(meetingsPassed, product.meetingsCount || 10);
    
    return {
      current: currentMeeting,
      total: product.meetingsCount || 10
    };
  };

  const handleExport = () => {
    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
    exportDailyActivitiesToCSV(activities, formattedDate);
  };

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">פעילות יומית</h1>
        <div className="flex gap-2">
          <div className="flex gap-2 items-center">
            <Input
              type="text"
              placeholder="YYYY-MM-DD"
              value={dateInputValue}
              onChange={handleDateInputChange}
              className="w-32"
            />
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
                  onSelect={(date) => {
                    if (date) {
                      setSelectedDate(date);
                      setDateInputValue(format(date, 'yyyy-MM-dd'));
                    }
                  }}
                  weekStartsOn={0}
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
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
            {activities.map((activity, idx) => {
              // Calculate meeting number based on the selected date
              const meetingInfo = calculateMeetingNumberForDate(activity.product, selectedDate);
              
              return (
                <TableRow key={idx}>
                  <TableCell className="font-medium">{activity.product.name}</TableCell>
                  <TableCell>{activity.startTime || 'לא מוגדר'}</TableCell>
                  <TableCell>
                    {`${meetingInfo.current}/${meetingInfo.total}`}
                  </TableCell>
                  <TableCell>{activity.numParticipants}</TableCell>
                  <TableCell>{activity.product.type}</TableCell>
                </TableRow>
              );
            })}
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
