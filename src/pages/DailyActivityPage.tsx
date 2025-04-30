import React, { useState } from 'react';
import { useData } from '@/context/DataContext';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, parse, isValid } from 'date-fns';
import { he } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { exportDailyActivitiesToCSV } from '@/utils/exportUtils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DailyActivityPage: React.FC = () => {
  const { getDailyActivities } = useData();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dateInputValue, setDateInputValue] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const isMobile = useIsMobile();

  // Convert the date to a string format for the getDailyActivities function
  const dateString = format(selectedDate, 'yyyy-MM-dd');
  const activities = getDailyActivities(dateString);

  // Handle manual date input change
  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDateInputValue(value);
    
    // Parse the date if valid
    const parsedDate = parse(value, 'yyyy-MM-dd', new Date());
    if (isValid(parsedDate)) {
      setSelectedDate(parsedDate);
    }
  };

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

  // Format the activities with the required data for export
  const getFormattedActivities = () => {
    const dayOfWeekFormatted = format(selectedDate, 'EEEE', { locale: he });
    
    return activities.map(activity => {
      const meetingInfo = calculateMeetingNumberForDate(activity.product, selectedDate);
      return {
        ...activity,
        formattedDayOfWeek: dayOfWeekFormatted, // Add formatted day of week
        currentMeeting: meetingInfo.current, // Add current meeting number
        totalMeetings: meetingInfo.total, // Add total meetings
      };
    });
  };

  const handleExport = () => {
    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
    const formattedActivities = getFormattedActivities();
    exportDailyActivitiesToCSV(formattedActivities, `daily-activities-${formattedDate}.csv`);
  };

  return (
    <div className="container mx-auto">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">פעילות יומית</h1>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              type="date"
              value={dateInputValue}
              onChange={handleDateInputChange}
              className="w-full sm:w-auto"
            />
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full sm:w-auto justify-between text-right font-normal",
                  )}
                >
                  <span>{format(selectedDate, "d בMMMM yyyy", { locale: he })}</span>
                  <CalendarIcon className="mr-2 h-4 w-4" />
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
                  captionLayout="dropdown"
                  fromYear={2020}
                  toYear={2030}
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
          <Button 
            variant="outline" 
            onClick={handleExport} 
            className="w-full sm:w-auto"
          >
            ייצוא לאקסל
          </Button>
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
      ) : (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <p className="text-lg text-gray-500">אין פעילויות ביום זה</p>
        </div>
      )}
    </div>
  );
};

export default DailyActivityPage;
