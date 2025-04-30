
import React from 'react';
import { Season } from '@/types';
import SeasonList from '@/components/seasons/SeasonList';

interface SeasonSummaryProps {
  seasons: Season[];
  seasonProducts: Record<string, number>;
}

const SeasonSummary: React.FC<SeasonSummaryProps> = ({ 
  seasons, 
  seasonProducts
}) => {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-alef">עונות שחייה</h1>
      </div>
      
      <SeasonList 
        seasons={seasons} 
        seasonProducts={seasonProducts} 
      />
    </div>
  );
};

export default SeasonSummary;
