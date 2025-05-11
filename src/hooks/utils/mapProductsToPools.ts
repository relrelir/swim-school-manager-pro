
import { Pool, Product } from "@/types";

export function mapProductsToPools(products: Product[], pools: Pool[]): Record<string, number> {
  const poolCounts: Record<string, number> = {};
  
  // Guard against null or undefined inputs
  if (!products || !pools) {
    return poolCounts;
  }
  
  // Initialize with zero counts for all pools
  pools.forEach(pool => {
    if (pool && pool.id) {
      poolCounts[pool.id] = 0;
    }
  });
  
  // Count products for each pool
  products.forEach(product => {
    if (product && product.poolId && poolCounts[product.poolId] !== undefined) {
      poolCounts[product.poolId] += 1;
    }
  });
  
  return poolCounts;
}
