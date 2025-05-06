
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/use-toast";
import { HealthDeclaration } from '@/types';
import { mapHealthDeclarationToDB } from './mappers';
import { handleSupabaseError } from '../utils';
import type { PostgrestResponse } from '@supabase/supabase-js';

/**
 * Updates an existing health declaration
 */
export const updateHealthDeclarationService = async (id: string, updates: Partial<HealthDeclaration>) => {
  try {
    const dbUpdates = mapHealthDeclarationToDB(updates);
    
    // Log the update operation without exposing potentially large signature data
    const logUpdates = { ...dbUpdates };
    if (logUpdates.signature) {
      logUpdates.signature = '[Signature data present]';
    }
    
    console.log('Updating health declaration with id:', id, 'and data:', logUpdates);
    
    // Breaking down the query chain and using explicit typing
    const response: PostgrestResponse<any> = await supabase
      .from('health_declarations')
      .update(dbUpdates)
      .eq('id', id);
    
    const { error } = response;

    if (error) {
      console.error('Supabase error during health declaration update:', error);
      handleSupabaseError(error, 'updating health declaration');
      return false;
    }
    
    return true;
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
