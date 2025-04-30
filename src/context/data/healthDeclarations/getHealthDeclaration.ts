
import { supabase } from '@/integrations/supabase/client';
import { HealthDeclaration } from '@/types';
import { mapHealthDeclarationFromDB } from './mappers';
import type { PostgrestResponse } from '@supabase/supabase-js';

/**
 * Get a health declaration by its ID
 */
export const getHealthDeclarationById = async (id: string): Promise<HealthDeclaration | null> => {
  try {
    // Create a query builder first
    const query = supabase
      .from('health_declarations')
      .select('*')
      .eq('id', id);
    
    // Execute query with explicit typing
    const response: PostgrestResponse<any> = await query.maybeSingle();
    
    const { data, error } = response;

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

/**
 * Get a health declaration by its token
 */
export const getHealthDeclarationByToken = async (token: string): Promise<HealthDeclaration | null> => {
  try {
    // Create a query builder first
    const query = supabase
      .from('health_declarations')
      .select('*')
      .eq('token', token);
    
    // Execute query with explicit typing
    const response: PostgrestResponse<any> = await query.maybeSingle();
    
    const { data, error } = response;

    if (error) {
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
