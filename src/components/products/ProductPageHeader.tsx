
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Season, Pool } from '@/types';
import BackButton from '@/components/ui/back-button';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { useAuth } from '@/context/AuthContext';

interface ProductPageHeaderProps {
  currentSeason: Season | undefined;
  currentPool: Pool | undefined;
  formatDate: (date: string) => string;
  onAddProduct: () => void;
}

const ProductPageHeader: React.FC<ProductPageHeaderProps> = ({ 
  currentSeason,
  currentPool,
  formatDate,
  onAddProduct 
}) => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  // Create dynamic back URL and label
  const getBackInfo = () => {
    if (currentPool) {
      return {
        to: `/season/${currentSeason?.id}/pools`,
        label: 'חזרה לרשימת הבריכות'
      };
    }
    return {
      to: '/',
      label: 'חזרה לרשימת העונות'
    };
  };

  const backInfo = getBackInfo();

  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex items-center mb-2">
        <BackButton 
          to={backInfo.to} 
          label={backInfo.label} 
        />
      </div>
      
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">עונות</BreadcrumbLink>
          </BreadcrumbItem>
          
          {currentSeason && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href={`/season/${currentSeason.id}`}>{currentSeason.name}</BreadcrumbLink>
              </BreadcrumbItem>
            </>
          )}
          
          {currentPool && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href={`/season/${currentSeason?.id}/pools`}>בריכות</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href={`/season/${currentSeason?.id}/pool/${currentPool.id}`}>{currentPool.name}</BreadcrumbLink>
              </BreadcrumbItem>
            </>
          )}
          
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            מוצרים
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">
            {currentPool ? 
              `מוצרים - ${currentPool.name}` : 
              `מוצרים - ${currentSeason?.name || ''}`}
          </h1>
          
          {currentSeason && (
            <p className="text-muted-foreground">
              {formatDate(currentSeason.startDate)} - {formatDate(currentSeason.endDate)}
            </p>
          )}
        </div>
        
        {isAdmin() && (
          <Button className="flex items-center gap-2" onClick={onAddProduct}>
            <Plus className="h-4 w-4" />
            <span>הוסף מוצר</span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default ProductPageHeader;
