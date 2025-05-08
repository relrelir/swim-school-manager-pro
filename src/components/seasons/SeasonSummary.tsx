
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Season } from '@/types';
import SeasonList from './SeasonList';

interface SeasonSummaryProps {
  seasons: Season[];
  seasonProducts: Record<string, number>;
  onDeleteSeason: (seasonId: string) => void;
}

const SeasonSummary: React.FC<SeasonSummaryProps> = ({ 
  seasons, 
  seasonProducts, 
  onDeleteSeason 
}) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">עונות פעילות</h2>
      <SeasonList 
        seasons={seasons} 
        seasonProducts={seasonProducts} 
        onDeleteSeason={onDeleteSeason} 
      />
    </div>
  );
};

export default SeasonSummary;
