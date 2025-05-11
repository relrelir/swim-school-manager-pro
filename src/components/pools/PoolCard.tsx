
import React from 'react';
import { Pool } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Edit, Trash2, Loader2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface PoolCardProps {
  pool: Pool;
  deletingPoolId: string | null;
  loading: boolean;
  hasProducts: boolean;
  onNavigateToProducts: (poolId: string) => void;
  onEdit: (pool: Pool) => void;
  onDelete: (poolId: string) => void;
}

const PoolCard: React.FC<PoolCardProps> = ({
  pool,
  deletingPoolId,
  loading,
  hasProducts,
  onNavigateToProducts,
  onEdit,
  onDelete
}) => {
  const isDeleting = deletingPoolId === pool.id;
  const isDeleteDisabled = loading || isDeleting || hasProducts;
  
  console.log(`PoolCard: pool ${pool.id} (${pool.name}), hasProducts: ${hasProducts}, disabled: ${isDeleteDisabled}`);
  
  return (
    <Card key={pool.id} className="bg-white shadow-md hover:shadow-lg transition-shadow">
      <CardContent className="pt-6">
        <h2 className="text-xl font-semibold">{pool.name}</h2>
        {hasProducts && (
          <div className="mt-2 text-sm text-gray-500">
            מכיל מוצרים
          </div>
        )}
      </CardContent>
      <CardFooter className="bg-gray-50 flex flex-wrap gap-2 justify-end">
        <Button variant="outline" size="sm" onClick={() => onNavigateToProducts(pool.id)}>
          מוצרים
        </Button>
        <Button variant="outline" size="sm" onClick={() => onEdit(pool)}>
          <Edit className="h-4 w-4 ml-1" />
          ערוך
        </Button>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onDelete(pool.id)}
                  disabled={isDeleteDisabled}
                  className={hasProducts ? "cursor-not-allowed opacity-50" : ""}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="h-4 w-4 ml-1 animate-spin" />
                      מוחק...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 ml-1" />
                      מחק
                    </>
                  )}
                </Button>
              </div>
            </TooltipTrigger>
            {hasProducts && (
              <TooltipContent side="bottom">
                <p>לא ניתן למחוק בריכה עם מוצרים</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </CardFooter>
    </Card>
  );
};

export default PoolCard;
