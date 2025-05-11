
import React from "react";
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbSeparator 
} from '@/components/ui/breadcrumb';

interface ParticipantsBreadcrumbProps {
  seasonId?: string;
  poolId?: string;
  productName: string;
  poolName?: string;
}

const ParticipantsBreadcrumb: React.FC<ParticipantsBreadcrumbProps> = ({ 
  seasonId, 
  poolId, 
  productName,
  poolName 
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
                בריכות
              </BreadcrumbLink>
            </BreadcrumbItem>
          </>
        )}
        
        {poolId && poolName && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/season/${seasonId}/pool/${poolId}/products`}>
                מוצרים - {poolName}
              </BreadcrumbLink>
            </BreadcrumbItem>
          </>
        )}
        
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <span className="font-bold">משתתפים - {productName}</span>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default ParticipantsBreadcrumb;
