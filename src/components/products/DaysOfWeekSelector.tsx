
import React from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

interface DaysOfWeekSelectorProps {
  selectedDays: string[];
  onChange: (updatedDays: string[]) => void;
}

const DaysOfWeekSelector: React.FC<DaysOfWeekSelectorProps> = ({
  selectedDays,
  onChange,
}) => {
  // Hebrew days of the week - excluding Shabbat from selectable days
  const daysOfWeek = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי'];

  const handleDayToggle = (day: string, checked: boolean) => {
    const updatedDays = [...selectedDays];
    
    if (checked) {
      // Add day if it's not already in the array
      if (!updatedDays.includes(day)) {
        updatedDays.push(day);
      }
    } else {
      // Remove day if it exists in the array
      const index = updatedDays.indexOf(day);
      if (index >= 0) {
        updatedDays.splice(index, 1);
      }
    }
    
    onChange(updatedDays);
  };

  return (
    <div className="space-y-2">
      <Label>ימי פעילות</Label>
      <div className="grid grid-cols-4 gap-2">
        {daysOfWeek.map(day => (
          <div key={day} className="flex items-center space-x-2 space-x-reverse">
            <Checkbox 
              id={`day-${day}`}
              checked={selectedDays.includes(day)}
              onCheckedChange={(checked) => {
                handleDayToggle(day, checked === true);
              }}
            />
            <Label htmlFor={`day-${day}`} className="mr-2">{day}</Label>
          </div>
        ))}
        
        {/* Display Shabbat as disabled option */}
        <div key="שבת" className="flex items-center space-x-2 space-x-reverse opacity-50">
          <Checkbox 
            id="day-שבת"
            checked={false}
            disabled={true}
            onCheckedChange={() => {}}
          />
          <Label htmlFor="day-שבת" className="mr-2">שבת (יום מנוחה)</Label>
        </div>
      </div>
    </div>
  );
};

export default DaysOfWeekSelector;
