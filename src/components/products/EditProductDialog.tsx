
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Product } from '@/types';

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

  // Update form when product changes
  useEffect(() => {
    if (product) {
      setStartTime(product.startTime || '');
      setDaysOfWeek(product.daysOfWeek || []);
      setMeetingsCount(product.meetingsCount || 10);
    }
  }, [product]);

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
                
                <div className="space-y-2">
                  <Label>ימי פעילות</Label>
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
                  <Label htmlFor="meetings-count">מספר מפגשים</Label>
                  <Input
                    id="meetings-count"
                    type="number"
                    min={1}
                    value={meetingsCount}
                    onChange={(e) => setMeetingsCount(Number(e.target.value))}
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
