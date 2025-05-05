
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Season } from '@/types';

interface ProductPageHeaderProps {
  currentSeason: Season | undefined;
  formatDate: (dateString: string) => string;
  onAddProduct: () => void;
}

const ProductPageHeader: React.FC<ProductPageHeaderProps> = ({ 
  currentSeason, 
  formatDate, 
  onAddProduct 
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <Button variant="outline" onClick={() => navigate('/')}>חזרה לעונות</Button>
        <h1 className="text-2xl font-bold mt-2">
          {currentSeason ? `מוצרים בעונת ${currentSeason.name}` : 'מוצרים'}
        </h1>
        {currentSeason && (
          <p className="text-gray-600">
            {`${formatDate(currentSeason.startDate)} - ${formatDate(currentSeason.endDate)}`}
          </p>
        )}
      </div>
      <Button onClick={onAddProduct}>
        הוסף מוצר חדש
      </Button>
    </div>
  );
};

export default ProductPageHeader;
