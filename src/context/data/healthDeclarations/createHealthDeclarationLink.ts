
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/use-toast";
import { v4 as uuidv4 } from 'uuid';
import type { PostgrestError } from '@supabase/supabase-js';

/**
 * Create a health declaration link
 */
export const createHealthDeclarationLink = async (registrationId: string): Promise<string | null> => {
  try {
    // Generate a unique token
    const token = uuidv4();
    
    // Check if a declaration already exists for this registration
    const existingResult = await supabase
      .from('health_declarations')
      .select('id, form_status')
      .eq('participant_id', registrationId);
    
    // Type assertion after query execution
    const existingResponse = existingResult as {
      data: any[] | null;
      error: PostgrestError | null;
    };
    
    if (existingResponse.error) {
      console.error('Error checking existing declaration:', existingResponse.error);
      throw existingResponse.error;
    }
    
    let declarationId: string;
    
    if (existingResponse.data && existingResponse.data.length > 0) {
      // Update existing declaration with new token
      const updateResult = await supabase
        .from('health_declarations')
        .update({
          token,
          form_status: 'pending',
          submission_date: null,
          notes: null
        })
        .eq('id', existingResponse.data[0].id)
        .select('id');
      
      // Type assertion after query execution
      const updateResponse = updateResult as {
        data: any[] | null;
        error: PostgrestError | null;
      };
        
      if (updateResponse.error) {
        console.error('Error updating health declaration with new token:', updateResponse.error);
        throw updateResponse.error;
      }
      
      if (!updateResponse.data || updateResponse.data.length === 0) {
        throw new Error('No data returned when updating health declaration');
      }
      
      declarationId = updateResponse.data[0].id;
    } else {
      // Create new declaration
      const newDeclaration = {
        participant_id: registrationId,
        token,
        form_status: 'pending',
        created_at: new Date().toISOString(),
        phone_sent_to: '' // Required by the database schema but we don't use it
      };
      
      console.log('Creating new health declaration:', newDeclaration);
      
      const insertResult = await supabase
        .from('health_declarations')
        .insert(newDeclaration)
        .select('id');
      
      // Type assertion after query execution
      const insertResponse = insertResult as {
        data: any[] | null;
        error: PostgrestError | null;
      };
      
      if (insertResponse.error) {
        console.error('Error creating health declaration:', insertResponse.error);
        throw insertResponse.error;
      }
      
      if (!insertResponse.data || insertResponse.data.length === 0) {
        throw new Error('No data returned when creating health declaration');
      }
      
      declarationId = insertResponse.data[0].id;
    }
    
    // Return the full URL
    const baseUrl = window.location.origin;
    return `${baseUrl}/health-form/${token}`;
  } catch (error) {
    console.error('Error creating health declaration link:', error);
    toast({
      title: "שגיאה",
      description: "אירעה שגיאה ביצירת קישור להצהרת בריאות",
      variant: "destructive",
    });
    return null;
  }
};
