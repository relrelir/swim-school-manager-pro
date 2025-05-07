
import { supabase } from '@/integrations/supabase/client';
import { HealthDeclaration } from '@/types';
import { mapHealthDeclarationFromDB, mapHealthDeclarationToDB } from './mappers';
import { handleSupabaseError } from '../utils';

export const updateHealthDeclarationService = async (
  id: string,
  declaration: Partial<HealthDeclaration>
): Promise<HealthDeclaration | undefined> => {
  try {
    console.log('Updating health declaration:', id, 'with data:', declaration);
    
    // Convert to DB field names format for the update
    const dbDeclaration = mapHealthDeclarationToDB(declaration);
    
    const { data, error } = await supabase
      .from('health_declarations')
      .update(dbDeclaration)
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      handleSupabaseError(error, 'updating health declaration');
      return undefined;
    }
    
    if (data) {
      console.log('Health declaration updated successfully:', data);
      // Convert back to our TypeScript model format
      return mapHealthDeclarationFromDB(data);
    }
    
    console.error('No data returned from health declaration update');
    return undefined;
  } catch (error) {
    console.error('Error updating health declaration:', error);
    return undefined;
  }
};
