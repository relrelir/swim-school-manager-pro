
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/use-toast";
import { HealthDeclaration } from '@/types';
import { mapHealthDeclarationFromDB, mapHealthDeclarationToDB } from './mappers';
import { handleSupabaseError } from '../utils';
import { v4 as uuidv4 } from 'uuid';
import type { PostgrestResponse } from '@supabase/supabase-js';

/**
 * Adds a new health declaration
 */
export const addHealthDeclarationService = async (healthDeclaration: Omit<HealthDeclaration, 'id'>) => {
  try {
    // Generate a unique token if not provided
    if (!healthDeclaration.token) {
      healthDeclaration.token = uuidv4();
    }
    
    // Convert to DB field names format
    const dbHealthDeclaration = mapHealthDeclarationToDB({
      ...healthDeclaration,
      form_status: healthDeclaration.form_status || 'pending'
    });
    
    console.log('Pre-insert health declaration data:', dbHealthDeclaration);
    
    // Validate required fields
    if (!dbHealthDeclaration.participant_id) {
      throw new Error('Missing required participant_id field (registrationId)');
    }
    
    console.log('Final health declaration data for insert:', dbHealthDeclaration);
    
    // Breaking down the query chain and using explicit typing
    const response: PostgrestResponse<any> = await supabase
      .from('health_declarations')
      .insert(dbHealthDeclaration)
      .select();
      
    const { data, error } = response;

    if (error) {
      console.error('Supabase error during health declaration insert:', error);
      handleSupabaseError(error, 'adding health declaration');
      return undefined;
    }

    if (data && data.length > 0) {
      console.log('Health declaration created successfully:', data[0]);
      // Convert back to our TypeScript model format
      return mapHealthDeclarationFromDB(data[0]);
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
