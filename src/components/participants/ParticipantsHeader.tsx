
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Product } from '@/types';
import { ArrowRight, Plus } from 'lucide-react';

interface ParticipantsHeaderProps {
  product: Product | undefined;
  onExport: () => void; // Keeping this prop to maintain interface compatibility
  onAddParticipant: () => void;
}

const ParticipantsHeader: React.FC<ParticipantsHeaderProps> = ({ 
  product, 
  onAddParticipant 
}) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div className="flex flex-col">
        <div className="flex items-center gap-2 mb-1">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="flex gap-2">
            <ArrowRight className="h-4 w-4" />
            <span>חזרה למוצרים</span>
          </Button>
        </div>
        <h1 className="text-2xl font-bold font-alef">
          {product ? `משתתפים ב${product.name}` : 'משתתפים'}
        </h1>
      </div>
      
      <div className="flex gap-2">
        <Button onClick={onAddParticipant} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          <span>הוסף משתתף</span>
        </Button>
      </div>
    </div>
  );
};

export default ParticipantsHeader;
