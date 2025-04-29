
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { DialogFooter } from '@/components/ui/dialog';
import { Product } from '@/types';
import { format } from 'date-fns';

interface EditProductFormProps {
  editingProduct: Product;
  setEditingProduct: (product: Product) => void;
  onSubmit: (e: React.FormEvent) => void;
  calculatedEndDate?: string | null;
}

const EditProductForm: React.FC<EditProductFormProps> = ({
  editingProduct,
  setEditingProduct,
  onSubmit,
  calculatedEndDate
}) => {
  // Day of week options
  const daysOfWeek = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

  return (
    <form onSubmit={onSubmit}>
      <div className="space-y-4 py-2">
        {/* Product Information (read-only) */}
        <div className="bg-blue-50 p-4 rounded-md mb-4">
          <h3 className="font-semibold text-lg mb-2">{editingProduct.name}</h3>
          <p className="text-sm">סוג: {editingProduct.type}</p>
          <p className="text-sm">תאריך התחלה: {format(new Date(editingProduct.startDate), 'dd/MM/yyyy')}</p>
          <p className="text-sm">תאריך סיום נוכחי: {format(new Date(editingProduct.endDate), 'dd/MM/yyyy')}</p>
          {calculatedEndDate && (
            <p className="text-sm text-blue-600 font-semibold">
              תאריך סיום מחושב: {format(new Date(calculatedEndDate), 'dd/MM/yyyy')}
            </p>
          )}
          <p className="text-sm">מחיר: {editingProduct.price} ₪</p>
        </div>

        {/* Editable Fields */}
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
