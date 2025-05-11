
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Plus } from 'lucide-react';
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbSeparator 
} from '@/components/ui/breadcrumb';

interface PoolsPageHeaderProps {
  seasonName: string;
  onBackToSeasons: () => void;
  onAddPool: () => void;
}

const PoolsPageHeader: React.FC<PoolsPageHeaderProps> = ({
  seasonName,
  onBackToSeasons,
  onAddPool
}) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">עונות</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <span className="font-bold">בריכות - {seasonName}</span>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="text-2xl font-bold mt-2">
            בריכות - {seasonName}
          </h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onBackToSeasons} className="flex items-center gap-2">
            <ChevronLeft className="h-4 w-4" />
            <span>חזרה לעונות</span>
          </Button>
          <Button onClick={onAddPool} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span>הוסף בריכה</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PoolsPageHeader;
