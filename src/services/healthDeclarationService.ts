
import { supabase } from '@/integrations/supabase/client';
import { HealthDeclaration } from '@/types';
import { mapHealthDeclarationFromDB, mapHealthDeclarationToDB, handleSupabaseError } from '@/context/data/utils';

// Fetch all health declarations
export const fetchHealthDeclarations = async (): Promise<HealthDeclaration[]> => {
  try {
    const { data, error } = await supabase
      .from('health_declarations')
      .select('*');

    if (error) {
      handleSupabaseError(error, 'fetching health declarations');
      return [];
    }

    return data.map(declaration => mapHealthDeclarationFromDB(declaration));
  } catch (error) {
    console.error('Error loading health declarations:', error);
    throw new Error('Failed to fetch health declarations');
  }
};

// Add a health declaration
export const addHealthDeclaration = async (healthDeclaration: Omit<HealthDeclaration, 'id'>): Promise<HealthDeclaration | undefined> => {
  try {
    const dbHealthDeclaration = mapHealthDeclarationToDB(healthDeclaration);
    
    // Make sure participant_id is properly set
    if (!dbHealthDeclaration.participant_id) {
      console.error('Missing participant_id in health declaration');
      return undefined;
    }

    // Generate token if not provided
    if (!dbHealthDeclaration.token) {
      dbHealthDeclaration.token = crypto.randomUUID();
    }
    
    const { data, error } = await supabase
      .from('health_declarations')
      .insert([dbHealthDeclaration])
      .select()
      .single();

    if (error) {
      handleSupabaseError(error, 'adding health declaration');
      return undefined;
    }

    return data ? mapHealthDeclarationFromDB(data) : undefined;
  } catch (error) {
    console.error('Error adding health declaration:', error);
    throw new Error('Failed to add health declaration');
  }
};

// Update a health declaration
export const updateHealthDeclaration = async (id: string, updates: Partial<HealthDeclaration>): Promise<void> => {
  try {
    const dbUpdates = mapHealthDeclarationToDB(updates);
    
    const { error } = await supabase
      .from('health_declarations')
      .update(dbUpdates)
      .eq('id', id);

    if (error) {
      handleSupabaseError(error, 'updating health declaration');
    }
  } catch (error) {
    console.error('Error updating health declaration:', error);
    throw new Error('Failed to update health declaration');
  }
};

// Send SMS with health declaration link
export const sendHealthDeclarationSMS = async (healthDeclarationId: string, phone: string): Promise<{formLink?: string}> => {
  try {
    // Call the Supabase edge function to generate link
    const { error, data } = await supabase.functions.invoke('send-health-sms', {
      body: {
        declarationId: healthDeclarationId,
        phone: phone
      },
    });
    
    if (error) {
      throw new Error(`Error generating health form link: ${error.message}`);
    }

    return { formLink: data?.formLink };
  } catch (error) {
    console.error('Error generating health declaration link:', error);
    throw new Error('Failed to generate health form link');
  }
};

// Get a health declaration by registration ID
export const getHealthDeclarationByRegistrationId = (
  healthDeclarations: HealthDeclaration[], 
  registrationId: string
): HealthDeclaration | undefined => {
  return healthDeclarations.find(declaration => declaration.registrationId === registrationId);
};
