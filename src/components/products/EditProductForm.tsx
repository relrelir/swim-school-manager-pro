
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { DialogFooter } from '@/components/ui/dialog';
import { Product, ProductType } from '@/types';

interface EditProductFormProps {
  editingProduct: Product;
  setEditingProduct: (product: Product) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const EditProductForm: React.FC<EditProductFormProps> = ({
  editingProduct,
  setEditingProduct,
  onSubmit
}) => {
  // Day of week options
  const daysOfWeek = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

  return (
    <form onSubmit={onSubmit}>
      <div className="space-y-4 py-2">
        <div className="space-y-2">
          <Label htmlFor="edit-product-name">שם המוצר</Label>
          <Input
            id="edit-product-name"
            value={editingProduct.name}
            onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-product-type">סוג מוצר</Label>
          <Select 
            value={editingProduct.type} 
            onValueChange={(value) => setEditingProduct({ ...editingProduct, type: value as ProductType })}
          >
            <SelectTrigger id="edit-product-type">
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
            <Label htmlFor="edit-start-date">תאריך התחלה</Label>
            <Input
              id="edit-start-date"
              type="date"
              value={editingProduct.startDate}
              onChange={(e) => setEditingProduct({ ...editingProduct, startDate: e.target.value })}
              required
              className="ltr"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-end-date">תאריך סיום</Label>
            <Input
              id="edit-end-date"
              type="date"
              value={editingProduct.endDate}
              onChange={(e) => setEditingProduct({ ...editingProduct, endDate: e.target.value })}
              required
              className="ltr"
            />
          </div>
        </div>
        
        {/* Edit fields for meetings count, days of week, and start time */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="edit-meetings-count">מספר מפגשים</Label>
            <Input
              id="edit-meetings-count"
              type="number"
              value={editingProduct.meetingsCount || 1}
              onChange={(e) => setEditingProduct({ 
                ...editingProduct, 
                meetingsCount: parseInt(e.target.value) 
              })}
              required
              min={1}
              className="ltr"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-start-time">שעת התחלה</Label>
            <Input
              id="edit-start-time"
              type="time"
              value={editingProduct.startTime || ''}
              onChange={(e) => setEditingProduct({ ...editingProduct, startTime: e.target.value })}
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
                  id={`edit-day-${day}`}
                  checked={editingProduct.daysOfWeek?.includes(day)}
                  onCheckedChange={(checked) => {
                    let updatedDays = [...(editingProduct.daysOfWeek || [])];
                    if (checked) {
                      updatedDays.push(day);
                    } else {
                      updatedDays = updatedDays.filter(d => d !== day);
                    }
                    setEditingProduct({ ...editingProduct, daysOfWeek: updatedDays });
                  }}
                />
                <Label htmlFor={`edit-day-${day}`} className="mr-2">{day}</Label>
              </div>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="edit-price">מחיר</Label>
            <Input
              id="edit-price"
              type="number"
              value={editingProduct.price}
              onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
              required
              min={0}
              className="ltr"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-max-participants">מכסת משתתפים מקסימלית</Label>
            <Input
              id="edit-max-participants"
              type="number"
              value={editingProduct.maxParticipants}
              onChange={(e) => setEditingProduct({ ...editingProduct, maxParticipants: Number(e.target.value) })}
              required
              min={1}
              className="ltr"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-notes">הערות</Label>
          <Textarea
            id="edit-notes"
            value={editingProduct.notes}
            onChange={(e) => setEditingProduct({ ...editingProduct, notes: e.target.value })}
            placeholder="הערות נוספות לגבי המוצר"
            rows={3}
          />
        </div>
      </div>
      <DialogFooter className="mt-4">
        <Button type="submit">שמור שינויים</Button>
      </DialogFooter>
    </form>
  );
};

export default EditProductForm;
