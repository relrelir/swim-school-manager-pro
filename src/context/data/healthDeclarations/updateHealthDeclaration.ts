
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/use-toast";
import { HealthDeclaration } from '@/types';
import { mapHealthDeclarationToDB, mapHealthDeclarationFromDB } from './mappers';
import { handleSupabaseError } from '../utils';
import type { PostgrestResponse } from '@supabase/supabase-js';

/**
 * Updates an existing health declaration
 */
export const updateHealthDeclarationService = async (id: string, updates: Partial<HealthDeclaration>) => {
  try {
    const dbUpdates = mapHealthDeclarationToDB(updates);
    
    console.log('Updating health declaration with id:', id, 'and data:', dbUpdates);
    
    // Breaking down the query chain and using explicit typing
    const response: PostgrestResponse<any> = await supabase
      .from('health_declarations')
      .update(dbUpdates)
      .eq('id', id)
      .select();  // Add select() to return updated data
    
    const { data, error } = response;

    if (error) {
      console.error('Supabase error during health declaration update:', error);
      handleSupabaseError(error, 'updating health declaration');
      return undefined;
    }
    
    if (data && data.length > 0) {
      // Map from DB format to our TS model
      return mapHealthDeclarationFromDB(data[0]);
    }
    
    return undefined;
  } catch (error) {
    console.error('Error updating health declaration:', error);
    toast({
      title: "שגיאה",
      description: "אירעה שגיאה בעדכון הצהרת בריאות",
      variant: "destructive",
    });
    throw error;
  }
};

// Export with alias for backward compatibility
export const updateHealthDeclaration = updateHealthDeclarationService;
