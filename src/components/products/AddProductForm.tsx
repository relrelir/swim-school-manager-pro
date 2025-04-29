
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { DialogFooter } from '@/components/ui/dialog';
import { Product, ProductType } from '@/types';
import { Season } from '@/types';

interface AddProductFormProps {
  onSubmit: (product: Omit<Product, 'id'>) => void;
  currentSeason: Season | undefined;
}

const AddProductForm: React.FC<AddProductFormProps> = ({ onSubmit, currentSeason }) => {
  const [newProduct, setNewProduct] = useState<Omit<Product, 'id'>>({
    name: '',
    type: 'קורס',
    startDate: currentSeason?.startDate || '',
    endDate: currentSeason?.endDate || '',
    price: 0,
    maxParticipants: 10,
    notes: '',
    seasonId: currentSeason?.id || '',
    meetingsCount: 1,
    daysOfWeek: [],
    startTime: '',
  });

  // Update defaults if season changes
  useEffect(() => {
    if (currentSeason) {
      setNewProduct(prev => ({
        ...prev,
        startDate: currentSeason.startDate,
        endDate: currentSeason.endDate,
        seasonId: currentSeason.id,
      }));
    }
  }, [currentSeason]);

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(newProduct);
    setNewProduct({
      name: '',
      type: 'קורס',
      startDate: currentSeason?.startDate || '',
      endDate: currentSeason?.endDate || '',
      price: 0,
      maxParticipants: 10,
      notes: '',
      seasonId: currentSeason?.id || '',
      meetingsCount: 1,
      daysOfWeek: [],
      startTime: '',
    });
  };

  // Day of week options
  const daysOfWeek = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

  return (
    <form onSubmit={handleCreateProduct}>
      <div className="space-y-4 py-2">
        <div className="space-y-2">
          <Label htmlFor="product-name">שם המוצר</Label>
          <Input
            id="product-name"
            value={newProduct.name}
            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
            placeholder="לדוגמה: קורס שחייה למתחילים"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="product-type">סוג מוצר</Label>
          <Select 
            value={newProduct.type} 
            onValueChange={(value) => setNewProduct({ ...newProduct, type: value as ProductType })}
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
              value={newProduct.startDate}
              onChange={(e) => setNewProduct({ ...newProduct, startDate: e.target.value })}
              required
              className="ltr"
              min={currentSeason?.startDate}
              max={currentSeason?.endDate}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end-date">תאריך סיום</Label>
            <Input
              id="end-date"
              type="date"
              value={newProduct.endDate}
              onChange={(e) => setNewProduct({ ...newProduct, endDate: e.target.value })}
              required
              className="ltr"
              min={newProduct.startDate}
              max={currentSeason?.endDate}
            />
          </div>
        </div>
        
        {/* Meetings count, days of week, and start time */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="meetings-count">מספר מפגשים</Label>
            <Input
              id="meetings-count"
              type="number"
              value={newProduct.meetingsCount}
              onChange={(e) => setNewProduct({ 
                ...newProduct, 
                meetingsCount: parseInt(e.target.value) 
              })}
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
              value={newProduct.startTime}
              onChange={(e) => setNewProduct({ ...newProduct, startTime: e.target.value })}
              className="ltr"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label>ימי פעילות</Label>
          <div className="grid grid-cols-4 gap-2">
            {daysOfWeek.map(day => (
              <div key={day} className="flex items-center space-x-2 space-x-reverse">
                <Checkbox 
                  id={`day-${day}`}
                  checked={newProduct.daysOfWeek?.includes(day)}
                  onCheckedChange={(checked) => {
                    let updatedDays = [...(newProduct.daysOfWeek || [])];
                    if (checked) {
                      updatedDays.push(day);
                    } else {
                      updatedDays = updatedDays.filter(d => d !== day);
                    }
                    setNewProduct({ ...newProduct, daysOfWeek: updatedDays });
                  }}
                />
                <Label htmlFor={`day-${day}`} className="mr-2">{day}</Label>
              </div>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price">מחיר</Label>
            <Input
              id="price"
              type="number"
              value={newProduct.price}
              onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
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
              value={newProduct.maxParticipants}
              onChange={(e) => setNewProduct({ ...newProduct, maxParticipants: Number(e.target.value) })}
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
            value={newProduct.notes}
            onChange={(e) => setNewProduct({ ...newProduct, notes: e.target.value })}
            placeholder="הערות נוספות לגבי המוצר"
            rows={3}
          />
        </div>
      </div>
      <DialogFooter className="mt-4">
        <Button type="submit">צור מוצר</Button>
      </DialogFooter>
    </form>
  );
};

export default AddProductForm;
