
import React, { useEffect, useState } from 'react';
import { Season } from '@/types';
import SeasonList from '@/components/seasons/SeasonList';

interface SeasonSummaryProps {
  seasons: Season[];
  seasonProducts: Record<string, number>;
  onAddSeason: () => void;
}

const SeasonSummary: React.FC<SeasonSummaryProps> = ({ 
  seasons, 
  seasonProducts,
  onAddSeason
}) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">עונות שחייה</h1>
        <button onClick={onAddSeason} className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md">
          הוסף עונה
        </button>
      </div>
      
      <SeasonList 
        seasons={seasons} 
        seasonProducts={seasonProducts} 
      />
    </div>
  );
};

export default SeasonSummary;
