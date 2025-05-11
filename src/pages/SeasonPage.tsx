
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useData } from "@/context/DataContext";
import AddSeasonDialog from '@/components/seasons/AddSeasonDialog';
import SeasonSummary from '@/components/seasons/SeasonSummary';
import { Plus } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

export default function SeasonPage() {
  const { seasons, deleteSeason, getPoolsBySeason } = useData();
  const [isAddSeasonOpen, setIsAddSeasonOpen] = useState(false);
  const [seasonPoolCounts, setSeasonPoolCounts] = useState<Record<string, number>>({});

  // Calculate pool counts for each season
  useEffect(() => {
    const counts: Record<string, number> = {};
    seasons.forEach(s => {
      const poolsInSeason = getPoolsBySeason(s.id) || [];
      counts[s.id] = poolsInSeason.length;
    });
    setSeasonPoolCounts(counts);
  }, [seasons, getPoolsBySeason]);

  const handleDeleteSeason = async (seasonId: string) => {
    // Check if season has pools
    const poolCount = seasonPoolCounts[seasonId] || 0;
    
    if (poolCount > 0) {
      toast({
        title: "לא ניתן למחוק",
        description: "לא ניתן למחוק עונה עם בריכות",
        variant: "destructive",
      });
      return;
    }
    
    if (window.confirm("האם אתה בטוח שברצונך למחוק את העונה?")) {
      try {
        await deleteSeason(seasonId);
        toast({
          title: "העונה נמחקה",
          description: "העונה נמחקה בהצלחה",
        });
      } catch (error) {
        console.error("Error deleting season:", error);
        toast({
          title: "שגיאה",
          description: "אירעה שגיאה במחיקת העונה",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">עונות פעילות</h1>
        <Button className="flex items-center gap-2" onClick={() => setIsAddSeasonOpen(true)}>
          <Plus className="h-4 w-4" />
          <span>הוסף עונה</span>
        </Button>
      </div>

      <SeasonSummary
        seasons={seasons}
        seasonPools={seasonPoolCounts}
        onDeleteSeason={handleDeleteSeason}
      />

      <AddSeasonDialog 
        isOpen={isAddSeasonOpen}
        onOpenChange={setIsAddSeasonOpen}
      />
    </div>
  );
}
