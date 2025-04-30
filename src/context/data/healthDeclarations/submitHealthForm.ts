
import { supabase } from '@/integrations/supabase/client';
import { handleSupabaseError } from '../utils';
import type { PostgrestResponse } from '@supabase/supabase-js';

/**
 * Submit a completed health form
 */
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
      form_status: 'signed',
      submission_date: new Date().toISOString(),
      notes: notes || null
    };
    
    console.log('Submitting health form for declaration:', declarationId, 'with data:', updates);
    
    // Breaking down the query chain and using explicit typing
    const response: PostgrestResponse<any> = await supabase
      .from('health_declarations')
      .update(updates)
      .eq('id', declarationId)
      .select('participant_id');
    
    const { data, error } = response;

    if (error) {
      console.error('Supabase error during health form submission:', error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      throw new Error('Failed to retrieve registration data after form submission');
    }
    
    // Return the participant_id (registrationId) for further processing
    return data[0].participant_id;
  } catch (error) {
    console.error('Error submitting health form:', error);
    throw error;
  }
};
