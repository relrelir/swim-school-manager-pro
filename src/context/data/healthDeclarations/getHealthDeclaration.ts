
import { HealthDeclaration } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { mapHealthDeclarationFromDB } from './mappers';

/**
 * Get health declaration by registration ID
 */
export const getHealthDeclarationById = async (registrationId: string): Promise<HealthDeclaration | undefined> => {
  try {
    console.log('Getting health declaration for registration:', registrationId);
    
    const { data, error } = await supabase
      .from('health_declarations')
      .select('*')
      .eq('participant_id', registrationId)
      .maybeSingle();
      
    if (error) {
      console.error('Error fetching health declaration:', error);
      throw error;
    }
    
    if (data) {
      console.log('Found health declaration for registration:', registrationId);
      return mapHealthDeclarationFromDB(data);
    }
    
    console.log('No health declaration found for registration:', registrationId);
    return undefined;
  } catch (error) {
    console.error('Error in getHealthDeclarationById:', error);
    return undefined;
  }
};

/**
 * Get health declaration by token
 */
export const getHealthDeclarationByToken = async (token: string): Promise<HealthDeclaration | undefined> => {
  try {
    console.log('Getting health declaration by token:', token);
    
    const { data, error } = await supabase
      .from('health_declarations')
      .select('*')
      .eq('token', token)
      .maybeSingle();
      
    if (error) {
      console.error('Error fetching health declaration by token:', error);
      throw error;
    }
    
    if (data) {
      console.log('Found health declaration for token:', token);
      return mapHealthDeclarationFromDB(data);
    }
    
    console.log('No health declaration found for token:', token);
    return undefined;
  } catch (error) {
    console.error('Error in getHealthDeclarationByToken:', error);
    return undefined;
  }
};
