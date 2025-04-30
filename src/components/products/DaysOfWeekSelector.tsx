
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
  // Hebrew days of the week
  const daysOfWeek = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

  const handleDayToggle = (day: string, checked: boolean) => {
    let updatedDays = [...selectedDays];
    
    if (checked) {
      updatedDays.push(day);
    } else {
      updatedDays = updatedDays.filter(d => d !== day);
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
      </div>
    </div>
  );
};

export default DaysOfWeekSelector;
