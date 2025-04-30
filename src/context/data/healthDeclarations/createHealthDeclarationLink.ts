
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/use-toast";
import { v4 as uuidv4 } from 'uuid';
import type { PostgrestResponse } from '@supabase/supabase-js';

/**
 * Create a health declaration link
 */
export const createHealthDeclarationLink = async (registrationId: string): Promise<string | null> => {
  try {
    // Generate a unique token
    const token = uuidv4();
    
    // Check if a declaration already exists for this registration
    const { data: existingData, error: existingError }: PostgrestResponse<any> = await supabase
      .from('health_declarations')
      .select('id, form_status', { single: true })
      .eq('participant_id', registrationId);
    
    if (existingError && existingError.code !== 'PGRST116') { // PGRST116 is "No rows found"
      console.error('Error checking existing declaration:', existingError);
      throw existingError;
    }
    
    let declarationId: string;
    
    if (existingData) {
      // Update existing declaration with new token
      const { data: updateData, error: updateError }: PostgrestResponse<{ id: string }> = await supabase
        .from('health_declarations')
        .update({
          token,
          form_status: 'pending',
          submission_date: null,
          notes: null
        })
        .eq('id', existingData.id)
        .select('id', { single: true });
        
      if (updateError) {
        console.error('Error updating health declaration with new token:', updateError);
        throw updateError;
      }
      
      if (!updateData) {
        throw new Error('No data returned when updating health declaration');
      }
      
      declarationId = updateData.id;
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
      
      const { data: newData, error: insertError }: PostgrestResponse<{ id: string }> = await supabase
        .from('health_declarations')
        .insert(newDeclaration)
        .select('id', { single: true });
      
      if (insertError) {
        console.error('Error creating health declaration:', insertError);
        throw insertError;
      }
      
      if (!newData) {
        throw new Error('No data returned when creating health declaration');
      }
      
      declarationId = newData.id;
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
