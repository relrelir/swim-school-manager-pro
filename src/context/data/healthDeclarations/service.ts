
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
    
    // Map registrationId to participant_id for the DB schema
    const { registrationId, ...rest } = dbHealthDeclaration;
    const dbData = {
      ...rest,
      participant_id: registrationId
    };
    
    console.log('Creating health declaration with data:', dbData);
    
    const { data, error } = await supabase
      .from('health_declarations')
      .insert([dbData])
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
    
    // Handle the registrationId to participant_id mapping if present
    if (dbUpdates.registrationId) {
      const { registrationId, ...rest } = dbUpdates;
      const dbData = {
        ...rest,
        participant_id: registrationId
      };
      
      const { error } = await supabase
        .from('health_declarations')
        .update(dbData)
        .eq('id', id);

      if (error) {
        handleSupabaseError(error, 'updating health declaration');
      }
    } else {
      // No registrationId in the updates
      const { error } = await supabase
        .from('health_declarations')
        .update(dbUpdates)
        .eq('id', id);

      if (error) {
        handleSupabaseError(error, 'updating health declaration');
      }
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
