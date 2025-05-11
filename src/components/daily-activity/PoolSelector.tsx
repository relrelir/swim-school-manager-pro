
import React from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Pool } from '@/types';

interface PoolSelectorProps {
  selectedPoolId: string;
  onPoolChange: (poolId: string) => void;
  pools: Pool[];
}

const PoolSelector: React.FC<PoolSelectorProps> = ({
  selectedPoolId,
  onPoolChange,
  pools
}) => {
  return (
    <div className="flex flex-col">
      <label className="block text-sm font-medium mb-1">סנן לפי בריכה</label>
      <Select
        value={selectedPoolId}
        onValueChange={value => onPoolChange(value)}
      >
        <SelectTrigger className="w-full max-w-xs">
          <SelectValue placeholder="כל הבריכות" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">כל הבריכות</SelectItem>
          {pools.map(pool => (
            <SelectItem key={pool.id} value={pool.id}>
              {pool.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default PoolSelector;
