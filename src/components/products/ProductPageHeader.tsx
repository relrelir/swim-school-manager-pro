
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Season, Pool } from '@/types';
import { Link } from 'react-router-dom';
import BackButton from '@/components/ui/back-button';

interface ProductPageHeaderProps {
  currentSeason: Season | undefined;
  currentPool?: Pool | undefined;
  formatDate: (date: string) => string;
  onAddProduct: () => void;
}

const ProductPageHeader: React.FC<ProductPageHeaderProps> = ({
  currentSeason,
  currentPool,
  formatDate,
  onAddProduct
}) => {
  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            {currentPool ? (
              <BackButton 
                to={`/season/${currentSeason?.id}/pools`} 
                label="חזרה לרשימת הבריכות" 
              />
            ) : (
              <BackButton 
                to="/" 
                label="חזרה לרשימת העונות" 
              />
            )}
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link to="/" className="hover:text-primary">עונות</Link>
            {currentSeason && (
              <>
                <span>&lt;</span>
                <Link to={`/season/${currentSeason.id}`} className="hover:text-primary">
                  {currentSeason.name}
                </Link>
                
                {currentPool && (
                  <>
                    <span>&lt;</span>
                    <Link to={`/season/${currentSeason.id}/pools`} className="hover:text-primary">
                      בריכות
                    </Link>
                    <span>&lt;</span>
                    <span>{currentPool.name}</span>
                  </>
                )}
              </>
            )}
          </div>
          
          <h1 className="text-2xl font-bold font-alef">
            {currentPool ? `מוצרים - ${currentPool.name}` : 'מוצרים'}
            {currentSeason && ` (${currentSeason.name})`}
          </h1>
          
          {currentSeason && (
            <p className="text-gray-500">
              {formatDate(currentSeason.startDate)} - {formatDate(currentSeason.endDate)}
            </p>
          )}
        </div>
        
        <Button onClick={onAddProduct} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          <span>הוסף מוצר</span>
        </Button>
      </div>
    </div>
  );
};

export default ProductPageHeader;
