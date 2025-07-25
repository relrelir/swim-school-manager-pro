
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import { Product } from '@/types';
import { useAuth } from '@/context/AuthContext';

interface SeasonProductsTableActionsProps {
  product: Product;
  onEditProduct: (product: Product) => void;
}

const SeasonProductsTableActions: React.FC<SeasonProductsTableActionsProps> = ({ 
  product,
  onEditProduct
}) => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  
  return (
    <div className="flex space-x-2">
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => navigate(`/product/${product.id}/participants`)}
      >
        משתתפים
      </Button>
      
      {isAdmin() && (
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onEditProduct(product)}
        >
          <Edit className="h-4 w-4 ml-1" />
          ערוך
        </Button>
      )}
    </div>
  );
};

export default SeasonProductsTableActions;
