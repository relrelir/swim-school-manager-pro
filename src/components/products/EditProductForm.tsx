
import React from 'react';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { Product } from '@/types';
import ProductFormFields from './ProductFormFields';

interface EditProductFormProps {
  editingProduct: Product;
  setEditingProduct: React.Dispatch<React.SetStateAction<Product | null>>;
  onSubmit: (e: React.FormEvent) => void;
  calculatedEndDate: string | null;
  minStartDate?: string;
}

const EditProductForm: React.FC<EditProductFormProps> = ({
  editingProduct,
  setEditingProduct,
  onSubmit,
  calculatedEndDate,
  minStartDate
}) => {
  const handleChange = (field: keyof Product, value: any) => {
    setEditingProduct(prev => {
      if (!prev) return null;
      return { ...prev, [field]: value };
    });
  };

  if (!editingProduct) return null;

  return (
    <form onSubmit={onSubmit}>
      <ProductFormFields
        productName={editingProduct.name}
        productType={editingProduct.type}
        startDate={editingProduct.startDate}
        endDate={calculatedEndDate || editingProduct.endDate}
        isEndDateCalculated={!!calculatedEndDate}
        meetingsCount={editingProduct.meetingsCount || 1}
        startTime={editingProduct.startTime || ''}
        daysOfWeek={editingProduct.daysOfWeek || []}
        price={editingProduct.price}
        maxParticipants={editingProduct.maxParticipants || 10}
        notes={editingProduct.notes || ''}
        seasonStartDate={minStartDate}
        onProductNameChange={(value) => handleChange('name', value)}
        onProductTypeChange={(value) => handleChange('type', value)}
        onStartDateChange={(value) => handleChange('startDate', value)}
        onMeetingsCountChange={(value) => handleChange('meetingsCount', value)}
        onStartTimeChange={(value) => handleChange('startTime', value)}
        onDaysOfWeekChange={(value) => handleChange('daysOfWeek', value)}
        onPriceChange={(value) => handleChange('price', value)}
        onMaxParticipantsChange={(value) => handleChange('maxParticipants', value)}
        onNotesChange={(value) => handleChange('notes', value)}
      />
      <DialogFooter className="mt-4">
        <Button type="submit">שמור שינויים</Button>
      </DialogFooter>
    </form>
  );
};

export default EditProductForm;
