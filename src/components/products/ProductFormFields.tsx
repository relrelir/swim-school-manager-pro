
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProductType } from '@/types';
import DaysOfWeekSelector from './DaysOfWeekSelector';

interface ProductFormFieldsProps {
  productName: string;
  productType: ProductType;
  startDate: string;
  endDate: string | null;
  isEndDateCalculated: boolean;
  meetingsCount: number;
  startTime: string;
  daysOfWeek: string[];
  price: number;
  maxParticipants: number;
  notes: string;
  seasonStartDate?: string;
  seasonEndDate?: string;
  onProductNameChange: (value: string) => void;
  onProductTypeChange: (value: ProductType) => void;
  onStartDateChange: (value: string) => void;
  onMeetingsCountChange: (value: number) => void;
  onStartTimeChange: (value: string) => void;
  onDaysOfWeekChange: (value: string[]) => void;
  onPriceChange: (value: number) => void;
  onMaxParticipantsChange: (value: number) => void;
  onNotesChange: (value: string) => void;
}

const ProductFormFields: React.FC<ProductFormFieldsProps> = ({
  productName,
  productType,
  startDate,
  endDate,
  isEndDateCalculated,
  meetingsCount,
  startTime,
  daysOfWeek,
  price,
  maxParticipants,
  notes,
  seasonStartDate,
  seasonEndDate,
  onProductNameChange,
  onProductTypeChange,
  onStartDateChange,
  onMeetingsCountChange,
  onStartTimeChange,
  onDaysOfWeekChange,
  onPriceChange,
  onMaxParticipantsChange,
  onNotesChange,
}) => {
  return (
    <div className="space-y-4 py-2">
      <div className="space-y-2">
        <Label htmlFor="product-name">שם המוצר</Label>
        <Input
          id="product-name"
          value={productName}
          onChange={(e) => onProductNameChange(e.target.value)}
          placeholder="לדוגמה: קורס שחייה למתחילים"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="product-type">סוג מוצר</Label>
        <Select 
          value={productType} 
          onValueChange={(value) => onProductTypeChange(value as ProductType)}
        >
          <SelectTrigger id="product-type">
            <SelectValue placeholder="בחר סוג מוצר" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="קייטנה">קייטנה</SelectItem>
            <SelectItem value="חוג">חוג</SelectItem>
            <SelectItem value="קורס">קורס</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start-date">תאריך התחלה</Label>
          <Input
            id="start-date"
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            required
            className="ltr"
            max={seasonEndDate}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="end-date">תאריך סיום (מחושב)</Label>
          <Input
            id="end-date"
            type="date"
            value={endDate || ""}
            readOnly
            className="ltr bg-gray-100"
            title="תאריך הסיום מחושב אוטומטית לפי ימי הפעילות ומספר המפגשים"
          />
          {isEndDateCalculated && (
            <p className="text-xs text-blue-600">
              * מחושב אוטומטית לפי מספר המפגשים וימי הפעילות
            </p>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="meetings-count">מספר מפגשים</Label>
          <Input
            id="meetings-count"
            type="number"
            value={meetingsCount}
            onChange={(e) => onMeetingsCountChange(parseInt(e.target.value))}
            required
            min={1}
            className="ltr"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="start-time">שעת התחלה</Label>
          <Input
            id="start-time"
            type="time"
            value={startTime}
            onChange={(e) => onStartTimeChange(e.target.value)}
            className="ltr"
            required
          />
        </div>
      </div>
      
      <DaysOfWeekSelector 
        selectedDays={daysOfWeek} 
        onChange={onDaysOfWeekChange} 
      />
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">מחיר</Label>
          <Input
            id="price"
            type="number"
            value={price}
            onChange={(e) => onPriceChange(Number(e.target.value))}
            required
            min={0}
            className="ltr"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="max-participants">מכסת משתתפים מקסימלית</Label>
          <Input
            id="max-participants"
            type="number"
            value={maxParticipants}
            onChange={(e) => onMaxParticipantsChange(Number(e.target.value))}
            required
            min={1}
            className="ltr"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="notes">הערות</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="הערות נוספות לגבי המוצר"
          rows={3}
        />
      </div>
    </div>
  );
};

export default ProductFormFields;
