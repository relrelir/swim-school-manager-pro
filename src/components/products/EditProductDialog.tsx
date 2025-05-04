
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Product } from '@/types';
import { addDays } from 'date-fns';
import EditProductForm from './EditProductForm';

interface EditProductDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  onSubmit: (productData: Partial<Product>) => void;
}

const EditProductDialog: React.FC<EditProductDialogProps> = ({
  isOpen,
  onOpenChange,
  product,
  onSubmit,
}) => {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [calculatedEndDate, setCalculatedEndDate] = useState<string | null>(null);

  // Update form when product changes
  useEffect(() => {
    if (product) {
      setEditingProduct(product);
    }
  }, [product]);

  // Calculate estimated end date when days or meetings count change
  useEffect(() => {
    if (editingProduct && editingProduct.daysOfWeek && editingProduct.daysOfWeek.length > 0) {
      // Map Hebrew day names to numeric day of week (0 = Sunday, 1 = Monday, etc.)
      const dayNameToNumber: Record<string, number> = {
        'ראשון': 0,
        'שני': 1,
        'שלישי': 2,
        'רביעי': 3,
        'חמישי': 4,
        'שישי': 5,
        'שבת': 6
      };
  
      const selectedDayNumbers = editingProduct.daysOfWeek.map(day => dayNameToNumber[day]).sort();
      
      if (selectedDayNumbers.length > 0) {
        const start = new Date(editingProduct.startDate);
        let currentDate = new Date(start);
        let meetingsLeft = editingProduct.meetingsCount || 1;
        
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
    } else {
      setCalculatedEndDate(null);
    }
  }, [editingProduct?.daysOfWeek, editingProduct?.meetingsCount, editingProduct?.startDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      // Include price and all other necessary fields in the updated product data
      const updatedProduct: Partial<Product> = {
        price: editingProduct.price,
        meetingsCount: editingProduct.meetingsCount,
        daysOfWeek: editingProduct.daysOfWeek,
        startTime: editingProduct.startTime,
        maxParticipants: editingProduct.maxParticipants,
        notes: editingProduct.notes,
        endDate: calculatedEndDate || editingProduct.endDate,
        discountAmount: editingProduct.discountAmount,
        effectivePrice: editingProduct.effectivePrice,
        active: editingProduct.active // Include active field
      };
      
      onSubmit(updatedProduct);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>עריכת מוצר</DialogTitle>
          <DialogDescription>
            שינוי במפגשים או בימי הפעילות ישנה את תאריך הסיום המחושב.
          </DialogDescription>
        </DialogHeader>
        {editingProduct && (
          <EditProductForm
            editingProduct={editingProduct}
            setEditingProduct={setEditingProduct}
            onSubmit={handleSubmit}
            calculatedEndDate={calculatedEndDate}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditProductDialog;
