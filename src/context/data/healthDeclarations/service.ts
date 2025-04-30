
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
    
    // CRITICAL: Triple-check the participant_id is set correctly - this MUST be the registration ID
    if (!dbHealthDeclaration.participant_id) {
      console.error('Missing required participant_id field. Available data:', healthDeclaration);
      
      // Last resort fallback: try to extract from either source if we have it
      if (healthDeclaration.registrationId) {
        console.log('Setting participant_id from registrationId:', healthDeclaration.registrationId);
        dbHealthDeclaration.participant_id = healthDeclaration.registrationId;
      } else if (healthDeclaration.participant_id) {
        console.log('Using provided participant_id:', healthDeclaration.participant_id);
        dbHealthDeclaration.participant_id = healthDeclaration.participant_id;
      } else {
        throw new Error('Missing required participant_id field (registrationId)');
      }
    }
    
    // Validate required fields
    if (!dbHealthDeclaration.participant_id) {
      throw new Error('Missing required participant_id field');
    }
    
    if (!dbHealthDeclaration.phone_sent_to) {
      throw new Error('Missing required phone_sent_to field');
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
    
    console.log('Updating health declaration with id:', id, 'and data:', dbUpdates);
    
    const { error } = await supabase
      .from('health_declarations')
      .update(dbUpdates)
      .eq('id', id);

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

// Add a new function to submit a completed health form
export const submitHealthFormService = async (
  declarationId: string, 
  agreement: boolean, 
  notes: string | undefined
) => {
  try {
    if (!agreement) {
      throw new Error('Must agree to health declaration');
    }
    
    const updates = {
      form_status: 'completed',
      submission_date: new Date().toISOString(),
      notes: notes || null
    };
    
    console.log('Submitting health form for declaration:', declarationId, 'with data:', updates);
    
    const { error, data } = await supabase
      .from('health_declarations')
      .update(updates)
      .eq('id', declarationId)
      .select('participant_id')
      .single();

    if (error) {
      console.error('Supabase error during health form submission:', error);
      throw error;
    }
    
    if (!data || !data.participant_id) {
      throw new Error('Failed to retrieve registration data after form submission');
    }
    
    // Return the participant_id (registrationId) for further processing
    return data.participant_id;
  } catch (error) {
    console.error('Error submitting health form:', error);
    throw error;
  }
};

// Get a health declaration by its ID
export const getHealthDeclarationById = async (id: string): Promise<HealthDeclaration | null> => {
  try {
    const { data, error } = await supabase
      .from('health_declarations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching health declaration by ID:', error);
      return null;
    }

    if (data) {
      return mapHealthDeclarationFromDB(data);
    }
    
    return null;
  } catch (error) {
    console.error('Error getting health declaration by ID:', error);
    return null;
  }
};
