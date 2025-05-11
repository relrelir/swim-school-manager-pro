
import React from 'react';
import { Pool } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Plus } from 'lucide-react';
import PoolCard from './PoolCard';

interface PoolsListProps {
  pools: Pool[];
  loading: boolean;
  deletingPoolId: string | null;
  poolsWithProducts: Record<string, boolean>;
  onNavigateToProducts: (poolId: string) => void;
  onEdit: (pool: Pool) => void;
  onDelete: (poolId: string) => void;
  onAddPool: () => void;
}

const PoolsList: React.FC<PoolsListProps> = ({
  pools,
  loading,
  deletingPoolId,
  poolsWithProducts,
  onNavigateToProducts,
  onEdit,
  onDelete,
  onAddPool
}) => {
  if (loading && pools.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="mr-2">טוען בריכות...</span>
      </div>
    );
  }

  if (pools.length === 0) {
    return (
      <Card className="bg-gray-50">
        <CardContent className="p-6 flex flex-col items-center justify-center min-h-[200px]">
          <h3 className="text-xl font-medium mb-2">אין בריכות</h3>
          <p className="text-gray-500 mb-4">
            לא נמצאו בריכות בעונה זו. הוסף בריכה חדשה כדי להתחיל.
          </p>
          <Button variant="outline" onClick={onAddPool}>
            <Plus className="h-4 w-4 mr-2" />
            הוסף בריכה
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {pools.map(pool => (
        <PoolCard
          key={pool.id}
          pool={pool}
          deletingPoolId={deletingPoolId}
          loading={loading}
          hasProducts={poolsWithProducts[pool.id] || false}
          onNavigateToProducts={onNavigateToProducts}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default PoolsList;
