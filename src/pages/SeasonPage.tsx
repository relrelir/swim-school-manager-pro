
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useData } from "@/context/DataContext";
import { useSeasonProducts } from '@/hooks/useSeasonProducts';
import EditProductDialog from '@/components/products/EditProductDialog';
import AddSeasonDialog from '@/components/seasons/AddSeasonDialog';
import SeasonSummary from '@/components/seasons/SeasonSummary';
import SeasonProductsTable from '@/components/seasons/SeasonProductsTable';
import SeasonSummaryCards from '@/components/seasons/SeasonSummaryCards';
import { Plus } from 'lucide-react';

export default function SeasonPage() {
  const { seasons } = useData();
  const { 
    season, 
    seasonProducts,
    seasonSummary, 
    editingProduct, 
    isEditDialogOpen, 
    setIsEditDialogOpen, 
    handleEditProduct, 
    handleUpdateProduct,
    getProductMeetingInfo
  } = useSeasonProducts();

  const [isAddSeasonOpen, setIsAddSeasonOpen] = useState(false);
  const [seasonProductCounts, setSeasonProductCounts] = useState<Record<string, number>>({});
  
  // Calculate product counts for each season
  useEffect(() => {
    const productCounts: Record<string, number> = {};
    
    seasons.forEach(season => {
      const productsForSeason = seasonProducts.filter(p => p.seasonId === season.id);
      productCounts[season.id] = productsForSeason.length;
    });
    
    setSeasonProductCounts(productCounts);
  }, [seasons, seasonProducts]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold font-alef">ניהול עונות וקורסים</h1>
        
        <Button onClick={() => setIsAddSeasonOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          <span>הוסף עונה</span>
        </Button>
      </div>

      <SeasonSummary 
        seasons={seasons}
        seasonProducts={seasonProductCounts}
      />

      {season && (
        <div className="bg-white rounded-lg shadow-card p-6 animate-fade-in">
          <h2 className="text-xl font-semibold mb-4">סיכום עונה: {season.name}</h2>
          
          <SeasonSummaryCards 
            products={seasonProducts}
            registrationsCount={seasonSummary.registrationsCount}
            totalExpected={seasonSummary.totalExpected}
            totalPaid={seasonSummary.totalPaid}
          />
          
          <SeasonProductsTable 
            season={season}
            products={seasonProducts}
            getProductMeetingInfo={getProductMeetingInfo}
            onEditProduct={handleEditProduct}
          />
        </div>
      )}

      <AddSeasonDialog 
        isOpen={isAddSeasonOpen}
        onOpenChange={setIsAddSeasonOpen}
      />

      <EditProductDialog 
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        product={editingProduct}
        onSubmit={handleUpdateProduct}
      />
    </div>
  );
}
