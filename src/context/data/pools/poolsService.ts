
import { supabase } from '@/integrations/supabase/client';
import { Pool, SeasonPool } from '@/types';
import { toast } from '@/components/ui/use-toast';

// Fetch all pools from the database
export const fetchPools = async (): Promise<Pool[]> => {
  const { data, error } = await supabase
    .from('pools')
    .select('id, name, created_at, updated_at');
  
  if (error) {
    console.error('Error fetching pools:', error);
    toast({
      title: 'שגיאה',
      description: 'אירעה שגיאה בטעינת בריכות',
      variant: 'destructive'
    });
    return [];
  }

  return data.map(row => ({
    id: row.id,
    name: row.name,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));
};

// Fetch all season-pool mappings
export const fetchSeasonPools = async (): Promise<SeasonPool[]> => {
  const { data, error } = await supabase
    .from('season_pools')
    .select('season_id, pool_id');

  if (error) {
    console.error('Error fetching season pools mappings:', error);
    toast({
      title: 'שגיאה',
      description: 'אירעה שגיאה בטעינת מיפוי עונות-בריכות',
      variant: 'destructive'
    });
    return [];
  }

  return data.map(row => ({
    seasonId: row.season_id,
    poolId: row.pool_id
  }));
};

// Create a new pool
export const createPool = async (name: string): Promise<Pool | null> => {
  const { data, error } = await supabase
    .from('pools')
    .insert([{ name }])
    .select('id, name, created_at, updated_at')
    .single();

  if (error) {
    console.error('Error creating pool:', error);
    toast({
      title: 'שגיאה',
      description: 'אירעה שגיאה ביצירת בריכה חדשה',
      variant: 'destructive'
    });
    return null;
  }

  if (!data) return null;

  return {
    id: data.id,
    name: data.name,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
};

// Link a pool to a season
export const linkPoolToSeason = async (poolId: string, seasonId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('season_pools')
    .insert({ season_id: seasonId, pool_id: poolId });
  
  if (error) {
    console.error('Error linking pool to season:', error);
    toast({
      title: 'שגיאה',
      description: 'אירעה שגיאה בקישור הבריכה לעונה',
      variant: 'destructive'
    });
    return false;
  }

  return true;
};

// Update a pool's name
export const updatePoolName = async (id: string, name: string): Promise<boolean> => {
  const { error } = await supabase
    .from('pools')
    .update({ name, updated_at: new Date().toISOString() })
    .eq('id', id);
  
  if (error) {
    console.error('Error updating pool:', error);
    toast({
      title: 'שגיאה',
      description: 'אירעה שגיאה בעדכון הבריכה',
      variant: 'destructive'
    });
    return false;
  }

  return true;
};

// Check if pool has associated products
export const hasPoolProducts = async (poolId: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('products')
    .select('id')
    .eq('poolid', poolId);
  
  if (error) {
    console.error('Error checking pool products:', error);
    return true; // Return true to prevent deletion in case of error
  }

  return data && data.length > 0;
};

// Delete a pool and its season links
export const deletePoolAndLinks = async (poolId: string): Promise<boolean> => {
  // Delete season links first
  const { error: linkError } = await supabase
    .from('season_pools')
    .delete()
    .eq('pool_id', poolId);
  
  if (linkError) {
    console.error('Error deleting pool season links:', linkError);
    return false;
  }
  
  // Then delete the pool itself
  const { error: poolError } = await supabase
    .from('pools')
    .delete()
    .eq('id', poolId);
  
  if (poolError) {
    console.error('Error deleting pool:', poolError);
    return false;
  }
  
  return true;
};
