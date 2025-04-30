
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
    
    // Log the data we're about to send to the database
    console.log('Pre-insert health declaration data:', dbHealthDeclaration);
    console.log('Original health declaration input:', healthDeclaration);
    
    // Triple-check the participant_id is set correctly
    if (!dbHealthDeclaration.participant_id) {
      if (healthDeclaration.registrationId) {
        console.log('Setting participant_id from registrationId:', healthDeclaration.registrationId);
        dbHealthDeclaration.participant_id = healthDeclaration.registrationId;
      } else {
        console.error('Missing required participant_id and no registrationId available');
        throw new Error('Missing required participant_id field');
      }
    }
    
    // Final validation check
    if (!dbHealthDeclaration.participant_id) {
      throw new Error('Missing required participant_id field even after fallback');
    }
    
    console.log('Final health declaration data for insert:', dbHealthDeclaration);
    
    const { data, error } = await supabase
      .from('health_declarations')
      .insert([dbHealthDeclaration])
      .select()
      .single();

    if (error) {
      console.error('Supabase error during health declaration insert:', error);
      handleSupabaseError(error, 'adding health declaration');
      return undefined;
    }

    if (data) {
      console.log('Health declaration created successfully:', data);
      // Convert back to our TypeScript model format
      return mapHealthDeclarationFromDB(data);
    }
    
    console.error('No data returned from health declaration insert');
    return undefined;
  } catch (error) {
    console.error('Error adding health declaration:', error);
    toast({
      title: "שגיאה",
      description: "אירעה שגיאה בהוספת הצהרת בריאות חדשה",
      variant: "destructive",
    });
    return undefined;
  }
};

export const updateHealthDeclarationService = async (id: string, updates: Partial<HealthDeclaration>) => {
  try {
    const dbUpdates = mapHealthDeclarationToDB(updates);
    
    // Handle mapping for participant_id if registrationId is present
    if (updates.registrationId && !dbUpdates.participant_id) {
      dbUpdates.participant_id = updates.registrationId;
    }
    
    console.log('Updating health declaration with id:', id, 'and data:', dbUpdates);
    
    const { error } = await supabase
      .from('health_declarations')
      .update(dbUpdates)
      .eq('id', id);

    if (error) {
      console.error('Supabase error during health declaration update:', error);
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
