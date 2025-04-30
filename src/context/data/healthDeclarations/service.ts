
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/use-toast";
import { HealthDeclaration } from '@/types';
import { mapHealthDeclarationFromDB, mapHealthDeclarationToDB } from './mappers';
import { handleSupabaseError } from '../utils';

export const fetchHealthDeclarations = async () => {
  try {
    const { data, error } = await supabase
      .from('health_declarations')
      .select('*');

    if (error) {
      handleSupabaseError(error, 'fetching health declarations');
      return [];
    }

    if (data) {
      // Transform data to match our HealthDeclaration type
      return data.map(declaration => mapHealthDeclarationFromDB(declaration));
    }
    
    return [];
  } catch (error) {
    console.error('Error loading health declarations:', error);
    toast({
      title: "שגיאה",
      description: "אירעה שגיאה בטעינת הצהרות בריאות",
      variant: "destructive",
    });
    return [];
  }
};

export const addHealthDeclarationService = async (healthDeclaration: Omit<HealthDeclaration, 'id'>) => {
  try {
    // Convert to DB field names format
    const dbHealthDeclaration = mapHealthDeclarationToDB(healthDeclaration);
    
    // Ensure participant_id is properly set
    if (!dbHealthDeclaration.participant_id && healthDeclaration.registrationId) {
      dbHealthDeclaration.participant_id = healthDeclaration.registrationId;
    }
    
    // Final validation check
    if (!dbHealthDeclaration.participant_id) {
      throw new Error('Missing required participant_id field');
    }
    
    console.log('Creating health declaration with data:', dbHealthDeclaration);
    
    const { data, error } = await supabase
      .from('health_declarations')
      .insert([dbHealthDeclaration])
      .select()
      .single();

    if (error) {
      handleSupabaseError(error, 'adding health declaration');
      return undefined;
    }

    if (data) {
      // Convert back to our TypeScript model format
      return mapHealthDeclarationFromDB(data);
    }
  } catch (error) {
    console.error('Error adding health declaration:', error);
    toast({
      title: "שגיאה",
      description: "אירעה שגיאה בהוספת הצהרת בריאות חדשה",
      variant: "destructive",
    });
  }
  return undefined;
};

export const updateHealthDeclarationService = async (id: string, updates: Partial<HealthDeclaration>) => {
  try {
    const dbUpdates = mapHealthDeclarationToDB(updates);
    
    // Handle mapping for participant_id if registrationId is present
    if (updates.registrationId && !dbUpdates.participant_id) {
      dbUpdates.participant_id = updates.registrationId;
    }
    
    const { error } = await supabase
      .from('health_declarations')
      .update(dbUpdates)
      .eq('id', id);

    if (error) {
      handleSupabaseError(error, 'updating health declaration');
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
