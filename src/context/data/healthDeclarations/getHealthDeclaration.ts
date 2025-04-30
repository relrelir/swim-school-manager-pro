
import { supabase } from '@/integrations/supabase/client';
import { HealthDeclaration } from '@/types';
import { mapHealthDeclarationFromDB } from './mappers';
import type { PostgrestResponse } from '@supabase/supabase-js';

/**
 * Get a health declaration by its ID
 */
export const getHealthDeclarationById = async (id: string): Promise<HealthDeclaration | null> => {
  try {
    // Execute query with single option in select
    const { data, error }: PostgrestResponse<any> = await supabase
      .from('health_declarations')
      .select('*', { single: true })
      .eq('id', id);

    if (error) {
      // If not found, return null
      if (error.code === 'PGRST116') return null;
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

/**
 * Get a health declaration by its token
 */
export const getHealthDeclarationByToken = async (token: string): Promise<HealthDeclaration | null> => {
  try {
    // Execute query with single option in select
    const { data, error }: PostgrestResponse<any> = await supabase
      .from('health_declarations')
      .select('*', { single: true })
      .eq('token', token);

    if (error) {
      // If not found, return null
      if (error.code === 'PGRST116') return null;
      console.error('Error fetching health declaration by token:', error);
      return null;
    }

    if (data) {
      return mapHealthDeclarationFromDB(data);
    }
    
    return null;
  } catch (error) {
    console.error('Error getting health declaration by token:', error);
    return null;
  }
};
