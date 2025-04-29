
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Product } from '@/types';
import { addDays, format } from 'date-fns';

interface EditProductDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  onSubmit: (productData: Partial<Product>) => void;
}

const DAYS_OF_WEEK = [
  { label: 'ראשון', value: 'ראשון' },
  { label: 'שני', value: 'שני' },
  { label: 'שלישי', value: 'שלישי' },
  { label: 'רביעי', value: 'רביעי' },
  { label: 'חמישי', value: 'חמישי' },
  { label: 'שישי', value: 'שישי' },
  { label: 'שבת', value: 'שבת' },
];

const EditProductDialog: React.FC<EditProductDialogProps> = ({
  isOpen,
  onOpenChange,
  product,
  onSubmit,
}) => {
  const [startTime, setStartTime] = useState(product?.startTime || '');
  const [daysOfWeek, setDaysOfWeek] = useState<string[]>(product?.daysOfWeek || []);
  const [meetingsCount, setMeetingsCount] = useState<number>(product?.meetingsCount || 10);
  const [calculatedEndDate, setCalculatedEndDate] = useState<string | null>(null);

  // Update form when product changes
  useEffect(() => {
    if (product) {
      setStartTime(product.startTime || '');
      setDaysOfWeek(product.daysOfWeek || []);
      setMeetingsCount(product.meetingsCount || 10);
      setCalculatedEndDate(null);
    }
  }, [product]);

  // Calculate estimated end date when days or meetings count change
  useEffect(() => {
    if (product && daysOfWeek.length > 0) {
      // This is just for display - actual calculation happens in the hook
      const dayNameToNumber: Record<string, number> = {
        'ראשון': 0,
        'שני': 1,
        'שלישי': 2,
        'רביעי': 3,
        'חמישי': 4,
        'שישי': 5,
        'שבת': 6
      };
  
      const selectedDayNumbers = daysOfWeek.map(day => dayNameToNumber[day]).sort();
      
      if (selectedDayNumbers.length > 0) {
        const start = new Date(product.startDate);
        let currentDate = new Date(start);
        let meetingsLeft = meetingsCount;
        
        while (meetingsLeft > 0) {
          const currentDayOfWeek = currentDate.getDay();
          
          if (selectedDayNumbers.includes(currentDayOfWeek)) {
            meetingsLeft--;
          }
          
          if (meetingsLeft > 0) {
            currentDate = addDays(currentDate, 1);
          }
        }
        
        setCalculatedEndDate(currentDate.toISOString().split('T')[0]);
      } else {
        setCalculatedEndDate(null);
      }
    }
  }, [daysOfWeek, meetingsCount, product]);

  const handleDayToggle = (day: string) => {
    setDaysOfWeek(current => 
      current.includes(day) 
        ? current.filter(d => d !== day)
        : [...current, day]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      startTime,
      daysOfWeek,
      meetingsCount
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>ערוך פרטי מוצר</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-2">
            {product && (
              <>
                <div className="bg-blue-50 p-4 rounded mb-4">
                  <p className="font-semibold">{product.name}</p>
                  <p>{product.type}</p>
                  <p className="mt-2">תאריך התחלה: {new Date(product.startDate).toLocaleDateString('he-IL')}</p>
                  <p>תאריך סיום נוכחי: {new Date(product.endDate).toLocaleDateString('he-IL')}</p>
                  {calculatedEndDate && (
                    <p className="text-blue-600 font-medium mt-1">
                      תאריך סיום מחושב: {new Date(calculatedEndDate).toLocaleDateString('he-IL')}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="meetings-count">מספר מפגשים (כולל השלמות)</Label>
                  <Input
                    id="meetings-count"
                    type="number"
                    min={1}
                    value={meetingsCount}
                    onChange={(e) => setMeetingsCount(Number(e.target.value))}
                    className="ltr"
                  />
                </div>

                <div className="space-y-2">
                  <Label>ימי פעילות בשבוע</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {DAYS_OF_WEEK.map((day) => (
                      <div key={day.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`day-${day.value}`}
                          checked={daysOfWeek.includes(day.value)}
                          onCheckedChange={() => handleDayToggle(day.value)}
                        />
                        <Label htmlFor={`day-${day.value}`} className="mr-2">{day.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="start-time">שעת התחלה</Label>
                  <Input
                    id="start-time"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="ltr"
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter className="mt-4">
            <Button type="submit">שמור שינויים</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProductDialog;
