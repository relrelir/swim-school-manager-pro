
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
  const { data, error, count } = await supabase
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('poolid', poolId);
  
  if (error) {
    console.error('Error checking pool products:', error);
    return true; // Return true to prevent deletion in case of error
  }

  return count ? count > 0 : false;
};

// Delete a pool
export const deletePool = async (poolId: string): Promise<boolean> => {
  console.log('Attempting to delete pool with ID:', poolId);
  
  try {
    // First verify the pool exists
    const { data: existingPool, error: checkError } = await supabase
      .from('pools')
      .select('id')
      .eq('id', poolId)
      .single();
      
    if (checkError) {
      console.error('Error checking if pool exists:', checkError);
      // If the error is that the pool doesn't exist, we'll consider the deletion successful
      if (checkError.code === 'PGRST116') {
        console.log('Pool already does not exist:', poolId);
        return true;
      }
      
      toast({
        title: 'שגיאה',
        description: 'אירעה שגיאה בבדיקת הבריכה',
        variant: 'destructive'
      });
      return false;
    }
    
    if (!existingPool) {
      console.log('Pool does not exist:', poolId);
      // Pool doesn't exist, consider deletion successful
      return true;
    }
    
    // Now attempt to delete the pool
    const { error: deleteError } = await supabase
      .from('pools')
      .delete()
      .eq('id', poolId);
    
    if (deleteError) {
      console.error('Error deleting pool:', deleteError);
      toast({
        title: 'שגיאה',
        description: 'אירעה שגיאה במחיקת הבריכה',
        variant: 'destructive'
      });
      return false;
    }
    
    // Verify the pool was actually deleted
    const { data: checkDeleted, error: verifyError } = await supabase
      .from('pools')
      .select('id')
      .eq('id', poolId);
      
    if (verifyError) {
      console.error('Error verifying pool deletion:', verifyError);
    } else if (checkDeleted && checkDeleted.length > 0) {
      console.error('Pool still exists after deletion attempt:', poolId);
      toast({
        title: 'שגיאה',
        description: 'הבריכה לא נמחקה מהמסד נתונים',
        variant: 'destructive'
      });
      return false;
    }
    
    // Successfully deleted the pool
    console.log('Pool deleted successfully from Supabase:', poolId);
    toast({
      title: 'בריכה נמחקה',
      description: 'הבריכה נמחקה בהצלחה',
      variant: 'default'
    });
    
    return true;
  } catch (e) {
    console.error('Exception in deletePool:', e);
    toast({
      title: 'שגיאה',
      description: 'אירעה שגיאה במחיקת הבריכה',
      variant: 'destructive'
    });
    return false;
  }
};
