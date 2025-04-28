
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useData } from '@/context/DataContext';
import { Product, Season } from '@/types';
import { toast } from "@/components/ui/use-toast";
import { calculateCurrentMeeting } from '@/context/data/utils';

export const useSeasonProducts = () => {
  const { seasonId } = useParams<{ seasonId: string }>();
  const { 
    products, 
    seasons, 
    updateProduct,
    getProductsBySeason
  } = useData();
  
  const [season, setSeason] = useState<Season | null>(null);
  const [seasonProducts, setSeasonProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

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
    }
  }, [seasonId, seasons, products, getProductsBySeason]);

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsEditDialogOpen(true);
  };

  const handleUpdateProduct = async (productData: Partial<Product>) => {
    if (editingProduct) {
      const updatedProduct: Product = {
        ...editingProduct,
        ...productData
      };
      
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
    editingProduct,
    isEditDialogOpen,
    setIsEditDialogOpen,
    handleEditProduct,
    handleUpdateProduct,
    getProductMeetingInfo
  };
};
