import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import BackButton from '@/components/ui/back-button';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

const PoolsPage = () => {
  const { seasonId } = useParams<{ seasonId: string }>();
  const navigate = useNavigate();
  const { seasons, getPoolsBySeason } = useData();
  const [isAddPoolDialogOpen, setIsAddPoolDialogOpen] = useState(false);

  const currentSeason = useMemo(
    () => seasons.find(s => s.id === seasonId),
    [seasons, seasonId]
  );

  const pools = useMemo(
    () => seasonId ? getPoolsBySeason(seasonId) : [],
    [getPoolsBySeason, seasonId]
  );

  if (!currentSeason) {
    return <div className="text-center py-10">העונה לא נמצאה</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center mb-2">
          <BackButton to="/" label="חזרה לרשימת העונות" />
        </div>
        
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">עונות</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/season/${seasonId}`}>{currentSeason.name}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              בריכות
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">
            בריכות - {currentSeason.name}
          </h1>
          <Button onClick={() => setIsAddPoolDialogOpen(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span>הוסף בריכה</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pools.map(pool => (
          <Card key={pool.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle>{pool.name}</CardTitle>
            </CardHeader>
            <CardContent>
              {/* תוכן נוסף של הבריכה יכול להיות כאן */}
            </CardContent>
            <CardFooter className="bg-muted/40 pt-4">
              <Button 
                variant="default" 
                className="w-full"
                onClick={() => navigate(`/season/${seasonId}/pool/${pool.id}/products`)}
              >
                צפה במוצרים
              </Button>
            </CardFooter>
          </Card>
        ))}
        
        {pools.length === 0 && (
          <div className="col-span-full text-center py-10 bg-muted/40 rounded-lg">
            <p className="text-muted-foreground">לא נמצאו בריכות, אנא הוסף בריכה חדשה</p>
          </div>
        )}
      </div>

      {/* צריך להוסיף דיאלוג להוספת בריכה */}
    </div>
  );
};

export default PoolsPage;
