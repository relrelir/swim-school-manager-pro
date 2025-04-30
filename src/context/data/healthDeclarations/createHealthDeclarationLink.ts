
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
    const { data: existingData, error: existingError } = await supabase
      .from('health_declarations')
      .select('id, form_status')
      .eq('participant_id', registrationId);
    
    if (existingError) {
      console.error('Error checking existing declaration:', existingError);
      throw existingError;
    }
    
    let declarationId: string;
    
    if (existingData && existingData.length > 0) {
      // Update existing declaration with new token
      const { data: updateData, error: updateError } = await supabase
        .from('health_declarations')
        .update({
          token,
          form_status: 'pending',
          submission_date: null,
          notes: null
        })
        .eq('id', existingData[0].id)
        .select('id');
        
      if (updateError) {
        console.error('Error updating health declaration with new token:', updateError);
        throw updateError;
      }
      
      if (!updateData || updateData.length === 0) {
        throw new Error('No data returned when updating health declaration');
      }
      
      declarationId = updateData[0].id;
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
      
      const { data: newData, error: insertError } = await supabase
        .from('health_declarations')
        .insert(newDeclaration)
        .select('id');
      
      if (insertError) {
        console.error('Error creating health declaration:', insertError);
        throw insertError;
      }
      
      if (!newData || newData.length === 0) {
        throw new Error('No data returned when creating health declaration');
      }
      
      declarationId = newData[0].id;
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
