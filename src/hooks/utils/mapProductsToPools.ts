
import { Pool, Product } from "@/types";

export function mapProductsToPoolCounts(products: Product[], pools: Pool[]): Record<string, number> {
  const poolCounts: Record<string, number> = {};
  
  // Initialize with zero counts for all pools
  pools.forEach(pool => {
    poolCounts[pool.id] = 0;
  });
  
  // Count products for each pool
  products.forEach(product => {
    if (product.poolId) {
      poolCounts[product.poolId] = (poolCounts[product.poolId] || 0) + 1;
    }
  });
  
  return poolCounts;
}
