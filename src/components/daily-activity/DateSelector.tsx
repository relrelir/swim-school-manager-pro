import React, { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, parse, isValid } from 'date-fns';
import { he } from 'date-fns/locale';

interface DateSelectorProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

const DateSelector: React.FC<DateSelectorProps> = ({ selectedDate, onDateChange }) => {
  const [dateInputValue, setDateInputValue] = useState<string>(format(selectedDate, 'yyyy-MM-dd'));

  useEffect(() => {
    // Keep the input field in sync with selectedDate
    setDateInputValue(format(selectedDate, 'yyyy-MM-dd'));
  }, [selectedDate]);

  // Handle manual date input change
  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDateInputValue(value);
    
    // Parse the date if valid
    const parsedDate = parse(value, 'yyyy-MM-dd', new Date());
    if (isValid(parsedDate)) {
      onDateChange(parsedDate);
    }
  };

  return (
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
                onDateChange(date);
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
  );
};

export default DateSelector;
