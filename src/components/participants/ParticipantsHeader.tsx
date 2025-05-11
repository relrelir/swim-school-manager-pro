
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Product } from '@/types';
import { Plus } from 'lucide-react';
import BackButton from '@/components/ui/back-button';
import { useAuth } from '@/context/AuthContext';

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
  const { isAdmin } = useAuth();
  
  // Create back URL based on product information
  const getBackUrl = () => {
    if (product?.poolId) {
      return `/season/${product.seasonId}/pool/${product.poolId}/products`;
    }
    return `/season/${product.seasonId}`;
  };
  
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
      <div className="flex flex-col">
        <div className="flex items-center gap-2 mb-1">
          {product && (
            <BackButton 
              to={getBackUrl()} 
              label="חזרה למוצרים" 
            />
          )}
        </div>
        <h1 className="text-2xl font-bold font-alef">
          {product ? `משתתפים ב${product.name}` : 'משתתפים'}
        </h1>
        {product?.notes && (
          <div className="text-sm text-muted-foreground mt-1">
            <strong>הערות:</strong> {product.notes}
          </div>
        )}
      </div>
      
      <div className="flex gap-2">
        {isAdmin() && (
          <Button onClick={onAddParticipant} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span>הוסף משתתף</span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default ParticipantsHeader;
