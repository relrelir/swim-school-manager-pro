
import React from 'react';
import { Product } from '@/types';
import { Season } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import AddProductForm from '@/components/products/AddProductForm';
import EditProductDialog from '@/components/products/EditProductDialog';

interface ProductDialogsProps {
  isMobile: boolean;
  isAddProductOpen: boolean;
  setIsAddProductOpen: (open: boolean) => void;
  isEditProductOpen: boolean;
  setIsEditProductOpen: (open: boolean) => void;
  editingProduct: Product | null;
  currentSeason: Season | undefined;
  onCreateProduct: (product: Omit<Product, 'id'>) => void;
  onUpdateProduct: (product: Partial<Product>) => void;
}

const ProductDialogs: React.FC<ProductDialogsProps> = ({
  isMobile,
  isAddProductOpen,
  setIsAddProductOpen,
  isEditProductOpen,
  setIsEditProductOpen,
  editingProduct,
  currentSeason,
  onCreateProduct,
  onUpdateProduct
}) => {
  const renderAddProductForm = () => (
    <AddProductForm 
      onSubmit={onCreateProduct} 
      currentSeason={currentSeason}
    />
  );

  return (
    <>
      {/* Responsive Add Product - Dialog for desktop, Sheet for mobile */}
      {isMobile ? (
        <Sheet open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
          <SheetContent side="bottom" className="h-[85vh] overflow-y-auto">
            <SheetHeader className="mb-4">
              <SheetTitle className="text-right">הוסף מוצר חדש</SheetTitle>
            </SheetHeader>
            {renderAddProductForm()}
          </SheetContent>
        </Sheet>
      ) : (
        <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>הוסף מוצר חדש</DialogTitle>
            </DialogHeader>
            {renderAddProductForm()}
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Product Dialog - Also using Sheet for mobile */}
      {isMobile ? (
        <Sheet open={isEditProductOpen} onOpenChange={setIsEditProductOpen}>
          <SheetContent side="bottom" className="h-[85vh] overflow-y-auto">
            <SheetHeader className="mb-4">
              <SheetTitle className="text-right">עריכת מוצר</SheetTitle>
            </SheetHeader>
            {editingProduct && (
              <EditProductDialog
                isOpen={isEditProductOpen}
                onOpenChange={setIsEditProductOpen}
                product={editingProduct}
                onSubmit={onUpdateProduct}
              />
            )}
          </SheetContent>
        </Sheet>
      ) : (
        <Dialog open={isEditProductOpen} onOpenChange={setIsEditProductOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>עריכת מוצר</DialogTitle>
            </DialogHeader>
            {editingProduct && (
              <EditProductDialog
                isOpen={isEditProductOpen}
                onOpenChange={setIsEditProductOpen}
                product={editingProduct}
                onSubmit={onUpdateProduct}
              />
            )}
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default ProductDialogs;
