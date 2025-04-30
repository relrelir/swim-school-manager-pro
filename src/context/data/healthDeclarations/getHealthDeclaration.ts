
import { supabase } from '@/integrations/supabase/client';
import { HealthDeclaration } from '@/types';
import { mapHealthDeclarationFromDB } from './mappers';
import type { PostgrestResponse } from '@supabase/supabase-js';

/**
 * Get a health declaration by its ID
 */
export const getHealthDeclarationById = async (id: string): Promise<HealthDeclaration | null> => {
  try {
    // Execute query
    const { data, error } = await supabase
      .from('health_declarations')
      .select('*')
      .eq('id', id);

    if (error) {
      console.error('Error fetching health declaration by ID:', error);
      return null;
    }

    if (data && data.length > 0) {
      return mapHealthDeclarationFromDB(data[0]);
    }
    
    return null;
  } catch (error) {
    console.error('Error getting health declaration by ID:', error);
    return null;
  }
};

/**
 * Get a health declaration by its token
 */
export const getHealthDeclarationByToken = async (token: string): Promise<HealthDeclaration | null> => {
  try {
    // Execute query
    const { data, error } = await supabase
      .from('health_declarations')
      .select('*')
      .eq('token', token);

    if (error) {
      console.error('Error fetching health declaration by token:', error);
      return null;
    }

    if (data && data.length > 0) {
      return mapHealthDeclarationFromDB(data[0]);
    }
    
    return null;
  } catch (error) {
    console.error('Error getting health declaration by token:', error);
    return null;
  }
};
