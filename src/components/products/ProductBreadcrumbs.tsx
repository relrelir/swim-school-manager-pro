
import React from 'react';
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbSeparator 
} from '@/components/ui/breadcrumb';
import { Season, Pool } from '@/types';

interface ProductBreadcrumbsProps {
  seasonId?: string;
  currentSeason?: Season;
  currentPool?: Pool;
}

const ProductBreadcrumbs: React.FC<ProductBreadcrumbsProps> = ({ 
  seasonId, 
  currentSeason, 
  currentPool 
}) => {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">עונות</BreadcrumbLink>
        </BreadcrumbItem>
        {seasonId && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/season/${seasonId}/pools`}>
                בריכות - {currentSeason?.name || ''}
              </BreadcrumbLink>
            </BreadcrumbItem>
          </>
        )}
        {currentPool && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <span className="font-bold">מוצרים - {currentPool.name}</span>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default ProductBreadcrumbs;
