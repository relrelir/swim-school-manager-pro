
import React from 'react';
import { Pool } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Edit, Trash2, Loader2 } from 'lucide-react';

interface PoolCardProps {
  pool: Pool;
  deletingPoolId: string | null;
  loading: boolean;
  onNavigateToProducts: (poolId: string) => void;
  onEdit: (pool: Pool) => void;
  onDelete: (poolId: string) => void;
}

const PoolCard: React.FC<PoolCardProps> = ({
  pool,
  deletingPoolId,
  loading,
  onNavigateToProducts,
  onEdit,
  onDelete
}) => {
  return (
    <Card key={pool.id} className="bg-white shadow-md hover:shadow-lg transition-shadow">
      <CardContent className="pt-6">
        <h2 className="text-xl font-semibold">{pool.name}</h2>
      </CardContent>
      <CardFooter className="bg-gray-50 flex flex-wrap gap-2 justify-end">
        <Button variant="outline" size="sm" onClick={() => onNavigateToProducts(pool.id)}>
          מוצרים
        </Button>
        <Button variant="outline" size="sm" onClick={() => onEdit(pool)}>
          <Edit className="h-4 w-4 ml-1" />
          ערוך
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onDelete(pool.id)}
          disabled={loading || deletingPoolId === pool.id}
        >
          {deletingPoolId === pool.id ? (
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
      </CardFooter>
    </Card>
  );
};

export default PoolCard;
