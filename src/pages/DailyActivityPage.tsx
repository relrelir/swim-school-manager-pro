
import React, { useState } from 'react';
import { useData } from '@/context/DataContext';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { exportDailyActivitiesToCSV } from '@/utils/exportUtils';
import DailyActivitySummaryCards from '@/components/daily-activity/DailyActivitySummaryCards';
import DateSelector from '@/components/daily-activity/DateSelector';
import ActivitiesTable from '@/components/daily-activity/ActivitiesTable';

const DailyActivityPage: React.FC = () => {
  const { getDailyActivities } = useData();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

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

  // Calculate total participants for summary card
  const totalParticipants = activities.reduce((sum, activity) => sum + activity.numParticipants, 0);

  return (
    <div className="container mx-auto">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">פעילות יומית</h1>
        <div className="flex flex-col sm:flex-row gap-2">
          <DateSelector 
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
          />
          <Button 
            variant="outline" 
            onClick={handleExport} 
            className="w-full sm:w-auto"
          >
            ייצוא לאקסל
          </Button>
        </div>
      </div>

      <DailyActivitySummaryCards 
        selectedDate={selectedDate}
        activitiesCount={activities.length}
        participantsCount={totalParticipants}
      />

      <ActivitiesTable 
        activities={activities}
        selectedDate={selectedDate}
        calculateMeetingNumberForDate={calculateMeetingNumberForDate}
      />
    </div>
  );
};

export default DailyActivityPage;
