
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useData } from "@/context/DataContext";
import { useSeasonProducts } from '@/hooks/useSeasonProducts';
import EditProductDialog from '@/components/products/EditProductDialog';
import AddSeasonDialog from '@/components/seasons/AddSeasonDialog';
import SeasonSummary from '@/components/seasons/SeasonSummary';
import SeasonProductsTable from '@/components/seasons/SeasonProductsTable';

export default function SeasonPage() {
  const { seasons } = useData();
  const { 
    season, 
    seasonProducts, 
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
    <div className="container mx-auto px-4 py-8">
      <SeasonSummary 
        seasons={seasons}
        seasonProducts={seasonProductCounts}
        onAddSeason={() => setIsAddSeasonOpen(true)}
      />

      {season && (
        <SeasonProductsTable 
          season={season}
          products={seasonProducts}
          getProductMeetingInfo={getProductMeetingInfo}
          onEditProduct={handleEditProduct}
        />
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
