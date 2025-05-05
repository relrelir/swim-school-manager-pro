
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useData } from '@/context/DataContext';
import { Product, Season } from '@/types';
import { toast } from "@/components/ui/use-toast";
import { calculateCurrentMeeting } from '@/context/data/utils';
import { addDays, getDay } from 'date-fns';

export const useSeasonProducts = () => {
  const { seasonId } = useParams<{ seasonId: string }>();
  const { 
    products, 
    seasons, 
    updateProduct,
    getProductsBySeason,
    registrations,
    getRegistrationsByProduct,
    payments,
    getPaymentsByRegistration
  } = useData();
  
  const [season, setSeason] = useState<Season | null>(null);
  const [seasonProducts, setSeasonProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [seasonSummary, setSeasonSummary] = useState({
    registrationsCount: 0,
    totalExpected: 0,
    totalPaid: 0
  });

  useEffect(() => {
    if (seasonId) {
      // Find the current season
      const currentSeason = seasons.find(s => s.id === seasonId);
      if (currentSeason) {
        setSeason(currentSeason);
      }

      // Get products for this season
      const productsForSeason = getProductsBySeason(seasonId);
      setSeasonProducts(productsForSeason);
      
      // Calculate season summary
      let registrationsCount = 0;
      let totalExpected = 0;
      let totalPaid = 0;
      
      productsForSeason.forEach(product => {
        const productRegistrations = getRegistrationsByProduct(product.id);
        registrationsCount += productRegistrations.length;
        
        // Calculate total expected (after discounts)
        totalExpected += productRegistrations.reduce((sum, reg) => 
          sum + Math.max(0, reg.requiredAmount - (reg.discountApproved ? (reg.discountAmount || 0) : 0)), 0);
        
        // Calculate total paid from payments
        totalPaid += productRegistrations.reduce((sum, reg) => {
          const regPayments = getPaymentsByRegistration(reg.id);
          if (regPayments.length === 0) return sum + reg.paidAmount;
          return sum + regPayments.reduce((pSum, payment) => pSum + payment.amount, 0);
        }, 0);
      });
      
      setSeasonSummary({
        registrationsCount,
        totalExpected,
        totalPaid
      });
    }
  }, [seasonId, seasons, products, registrations, payments, getProductsBySeason, getRegistrationsByProduct, getPaymentsByRegistration]);

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsEditDialogOpen(true);
  };

  // Calculate end date based on start date, meeting count and days of week
  const calculateEndDate = (startDate: string, meetingsCount: number, daysOfWeek: string[]): string => {
    if (!daysOfWeek || daysOfWeek.length === 0) {
      return startDate; // If no days selected, return start date
    }

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

    // Convert Hebrew day names to numeric values
    const selectedDayNumbers = daysOfWeek.map(day => dayNameToNumber[day]).sort();
    
    if (selectedDayNumbers.length === 0) {
      return startDate;
    }

    // Start date
    const start = new Date(startDate);
    let currentDate = new Date(start);
    let meetingsLeft = meetingsCount;
    
    // Process days until we've scheduled all meetings
    while (meetingsLeft > 0) {
      const currentDayOfWeek = getDay(currentDate);
      
      // Check if the current day is one of the selected days of the week
      if (selectedDayNumbers.includes(currentDayOfWeek)) {
        meetingsLeft--;
      }
      
      // If we still have meetings to schedule, advance to the next day
      if (meetingsLeft > 0) {
        currentDate = addDays(currentDate, 1);
      }
    }
    
    return currentDate.toISOString().split('T')[0];
  };

  const handleUpdateProduct = async (productData: Partial<Product>) => {
    if (editingProduct) {
      // If daysOfWeek and meetingsCount are provided, recalculate end date
      let endDate = editingProduct.endDate;
      
      if (productData.daysOfWeek && productData.meetingsCount) {
        endDate = calculateEndDate(
          editingProduct.startDate,
          productData.meetingsCount,
          productData.daysOfWeek
        );
      }
      
      // Calculate effective price after discount
      const price = productData.price !== undefined ? productData.price : editingProduct.price;
      const discountAmount = productData.discountAmount !== undefined ? 
                             productData.discountAmount : 
                             editingProduct.discountAmount || 0;
      const effectivePrice = Math.max(0, price - discountAmount);
      
      const updatedProduct: Product = {
        ...editingProduct,
        ...productData,
        endDate,
        price, // Ensure price is included
        discountAmount, // Ensure discount is included
        effectivePrice // Add the calculated effective price
      };
      
      console.log("Updating product with data:", updatedProduct);
      
      try {
        await updateProduct(updatedProduct);
        
        toast({
          title: "עדכון הצליח",
          description: "פרטי המוצר עודכנו בהצלחה",
        });
        
        // Update local state
        setSeasonProducts(current => 
          current.map(p => p.id === editingProduct.id ? updatedProduct : p)
        );
      } catch (error) {
        console.error("Error updating product:", error);
        toast({
          title: "שגיאה",
          description: "אירעה שגיאה בעדכון פרטי המוצר",
          variant: "destructive",
        });
      }
      
      setIsEditDialogOpen(false);
      setEditingProduct(null);
    }
  };

  const getProductMeetingInfo = (product: Product) => {
    return calculateCurrentMeeting(product);
  };

  return {
    season,
    seasonProducts,
    seasonSummary,
    editingProduct,
    isEditDialogOpen,
    setIsEditDialogOpen,
    handleEditProduct,
    handleUpdateProduct,
    getProductMeetingInfo,
    calculateEndDate
  };
};
