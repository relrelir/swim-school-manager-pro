
import { supabase } from '@/integrations/supabase/client';
import { Pool } from '@/types';
import { toast } from '@/components/ui/use-toast';

// Fetch all pools from the database
export const fetchPools = async (): Promise<Pool[]> => {
  const { data, error } = await supabase
    .from('pools')
    .select('id, name, seasonid, created_at, updated_at');
  
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
    seasonId: row.seasonid,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));
};

// Create a new pool
export const createPool = async (name: string, seasonId: string): Promise<Pool | null> => {
  const { data, error } = await supabase
    .from('pools')
    .insert([{ name, seasonid: seasonId }])
    .select('id, name, seasonid, created_at, updated_at')
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
    seasonId: data.seasonid,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
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

// Delete a pool
export const deletePoolAndLinks = async (poolId: string): Promise<boolean> => {
  // Delete the pool from Supabase
  const { error } = await supabase
    .from('pools')
    .delete()
    .eq('id', poolId);
  
  if (error) {
    console.error('Error deleting pool:', error);
    toast({
      title: 'שגיאה',
      description: 'אירעה שגיאה במחיקת הבריכה',
      variant: 'destructive'
    });
    return false;
  }
  
  // Successfully deleted the pool
  toast({
    title: 'בריכה נמחקה',
    description: 'הבריכה נמחקה בהצלחה',
    variant: 'default'
  });
  
  return true;
};
