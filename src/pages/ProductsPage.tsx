
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useData } from '@/context/DataContext';
import { Product } from '@/types';
import { useProductsTable } from '@/hooks/useProductsTable';
import { useIsMobile } from '@/hooks/use-mobile';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useSummaryCalculations } from '@/hooks/useSummaryCalculations';
import SeasonSummaryCards from '@/components/seasons/SeasonSummaryCards';

// Import newly created components
import AddProductForm from '@/components/products/AddProductForm';
import EditProductDialog from '@/components/products/EditProductDialog';
import ProductsTable from '@/components/products/ProductsTable';
import EmptyProductsState from '@/components/products/EmptyProductsState';

const ProductsPage: React.FC = () => {
  const { seasonId } = useParams<{ seasonId: string }>();
  const navigate = useNavigate();
  const { 
    seasons, 
    products, 
    addProduct, 
    getProductsBySeason, 
    updateProduct, 
    registrations,
    getRegistrationsByProduct,
    payments,
    getPaymentsByRegistration 
  } = useData();
  const isMobile = useIsMobile();
  
  const [currentSeason, setCurrentSeason] = useState(seasons.find(s => s.id === seasonId));
  const [seasonProducts, setSeasonProducts] = useState<Product[]>([]);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [summaryData, setSummaryData] = useState({
    registrationsCount: 0,
    totalExpected: 0,
    totalPaid: 0
  });

  // Use our custom hook for filtering and sorting
  const { 
    filter, 
    setFilter, 
    sortField, 
    sortDirection, 
    handleSort, 
    filteredAndSortedProducts 
  } = useProductsTable({ products: seasonProducts });
  
  useEffect(() => {
    if (seasonId) {
      const season = seasons.find(s => s.id === seasonId);
      setCurrentSeason(season);
      
      const products = getProductsBySeason(seasonId);
      setSeasonProducts(products);
    }
  }, [seasonId, seasons, getProductsBySeason]);

  // Calculate season summary data
  useEffect(() => {
    if (seasonProducts.length > 0) {
      let registrationsCount = 0;
      let totalExpected = 0;
      let totalPaid = 0;
      
      seasonProducts.forEach(product => {
        const productRegistrations = getRegistrationsByProduct(product.id);
        registrationsCount += productRegistrations.length;
        
        // Calculate total expected (after discounts)
        totalExpected += productRegistrations.reduce((sum, reg) => 
          sum + Math.max(0, reg.requiredAmount - (reg.discountApproved ? (reg.discountAmount || 0) : 0)), 0);
        
        // Calculate total paid including payments and approved discounts
        totalPaid += productRegistrations.reduce((sum, reg) => {
          const regPayments = getPaymentsByRegistration(reg.id);
          // Include real payments
          const paymentsTotal = regPayments.length === 0 ? reg.paidAmount : 
            regPayments.reduce((pSum, payment) => pSum + payment.amount, 0);
          
          // Add discount amount if approved
          const discountAmount = reg.discountApproved ? (reg.discountAmount || 0) : 0;
          
          return sum + paymentsTotal + discountAmount;
        }, 0);
      });
      
      setSummaryData({
        registrationsCount,
        totalExpected,
        totalPaid
      });
    }
  }, [seasonProducts, getRegistrationsByProduct, getPaymentsByRegistration]);

  const handleCreateProduct = (product: Omit<Product, 'id'>) => {
    addProduct(product);
    setIsAddProductOpen(false);
    // Refresh products list
    setSeasonProducts(getProductsBySeason(seasonId || ''));
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsEditProductOpen(true);
  };

  const handleUpdateProduct = (updatedData: Partial<Product>) => {
    if (editingProduct) {
      updateProduct({ ...editingProduct, ...updatedData });
      setIsEditProductOpen(false);
      setEditingProduct(null);
      // Refresh products list
      setSeasonProducts(getProductsBySeason(seasonId || ''));
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return dateString;
    }
  };

  // Function to render the Add Product form based on device
  const renderAddProductForm = () => (
    <AddProductForm 
      onSubmit={handleCreateProduct} 
      currentSeason={currentSeason}
    />
  );
  
  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Button variant="outline" onClick={() => navigate('/')}>חזרה לעונות</Button>
          <h1 className="text-2xl font-bold mt-2">
            {currentSeason ? `מוצרים בעונת ${currentSeason.name}` : 'מוצרים'}
          </h1>
          {currentSeason && (
            <p className="text-gray-600">
              {`${formatDate(currentSeason.startDate)} - ${formatDate(currentSeason.endDate)}`}
            </p>
          )}
        </div>
        <Button onClick={() => setIsAddProductOpen(true)}>
          הוסף מוצר חדש
        </Button>
      </div>
      
      {/* Add Season Summary Cards */}
      {currentSeason && (
        <SeasonSummaryCards
          products={seasonProducts}
          registrationsCount={summaryData.registrationsCount}
          totalExpected={summaryData.totalExpected}
          totalPaid={summaryData.totalPaid}
        />
      )}

      {/* Search and Filter */}
      <div className="mb-4">
        <Input
          placeholder="חיפוש לפי שם או סוג..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Products Table or Empty State */}
      <div className="overflow-x-auto">
        {filteredAndSortedProducts.length === 0 ? (
          <EmptyProductsState />
        ) : (
          <ProductsTable 
            products={filteredAndSortedProducts} 
            sortField={sortField} 
            sortDirection={sortDirection} 
            handleSort={handleSort}
            onEditProduct={handleEditProduct}
          />
        )}
      </div>

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
                onSubmit={handleUpdateProduct}
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
                onSubmit={handleUpdateProduct}
              />
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ProductsPage;
