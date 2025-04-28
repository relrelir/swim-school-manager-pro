
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useData } from '@/context/DataContext';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { exportDailyActivitiesToCSV } from '@/utils/exportUtils';

const DailyActivityPage: React.FC = () => {
  const navigate = useNavigate();
  const { getDailyActivities } = useData();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // Format the selected date to ISO format for the API
  const formattedDate = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';
  
  // Get activities for the selected date
  const activities = getDailyActivities(formattedDate);

  // Handle export
  const handleExport = () => {
    exportDailyActivitiesToCSV(
      activities,
      `פעילויות-יומיות-${format(selectedDate, 'yyyy-MM-dd')}.csv`
    );
  };

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Button variant="outline" onClick={() => navigate('/')}>חזרה לעונות</Button>
          <h1 className="text-2xl font-bold mt-2">דו"ח פעילות יומי</h1>
        </div>
        <div className="flex space-x-2 space-x-reverse">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="min-w-[240px] justify-start">
                <CalendarIcon className="ml-2" />
                {selectedDate ? format(selectedDate, 'dd/MM/yyyy') : 'בחר תאריך'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => setSelectedDate(date || new Date())}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
          <Button onClick={handleExport}>ייצוא לאקסל</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 flex flex-col items-center">
            <div className="text-2xl font-bold">{activities.length}</div>
            <div className="text-sm text-gray-500">פעילויות היום</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center">
            <div className="text-2xl font-bold">
              {activities.reduce((sum, activity) => sum + activity.numParticipants, 0)}
            </div>
            <div className="text-sm text-gray-500">סה"כ משתתפים</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center">
            <div className="text-2xl font-bold">
              {format(selectedDate, 'EEEE', { locale: require('date-fns/locale/he') })}
            </div>
            <div className="text-sm text-gray-500">יום בשבוע</div>
          </CardContent>
        </Card>
      </div>

      {activities.length === 0 ? (
        <div className="text-center p-10 bg-gray-50 rounded-lg">
          <p className="text-lg text-gray-500">אין פעילויות מתוכננות לתאריך זה.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>שעת התחלה</TableHead>
                <TableHead>שם פעילות</TableHead>
                <TableHead>סוג פעילות</TableHead>
                <TableHead>מספר משתתפים</TableHead>
                <TableHead>מפגש</TableHead>
                <TableHead>ימי פעילות</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activities.map((activity, index) => (
                <TableRow key={index}>
                  <TableCell>{activity.startTime || '-'}</TableCell>
                  <TableCell>{activity.product.name}</TableCell>
                  <TableCell>{activity.product.type}</TableCell>
                  <TableCell>{activity.numParticipants}</TableCell>
                  <TableCell>
                    {activity.currentMeetingNumber && activity.totalMeetings 
                      ? `${activity.currentMeetingNumber}/${activity.totalMeetings}` 
                      : '-'}
                  </TableCell>
                  <TableCell>{activity.product.daysOfWeek?.join(', ') || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default DailyActivityPage;
