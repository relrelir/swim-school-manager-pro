
import { toast } from "@/components/ui/use-toast";
import { v4 as uuidv4 } from 'uuid';

// Import the supabase client directly rather than through type-heavy interfaces
import { supabase } from '@/integrations/supabase/client';

/**
 * Create a health declaration link
 */
export const createHealthDeclarationLink = async (registrationId: string): Promise<string | null> => {
  try {
    // Generate a unique token
    const token = uuidv4();
    
    // First get the registration to find the participant_id
    const registrationResult = await supabase
      .from('registrations')
      .select('participantid')
      .eq('id', registrationId)
      .single();
    
    if (registrationResult.error) {
      console.error('Error fetching registration:', registrationResult.error);
      throw registrationResult.error;
    }
    
    if (!registrationResult.data || !registrationResult.data.participantid) {
      throw new Error('Registration not found or missing participant ID');
    }
    
    const participantId = registrationResult.data.participantid;
    
    // Check if a declaration already exists for this registration
    const existingResult = await supabase
      .from('health_declarations')
      .select('id, form_status')
      .eq('participant_id', participantId);
    
    if (existingResult.error) {
      console.error('Error checking existing declaration:', existingResult.error);
      throw existingResult.error;
    }
    
    let declarationId: string;
    
    if (existingResult.data && existingResult.data.length > 0) {
      // Update existing declaration with new token
      console.log('Updating existing health declaration with new token');
      const updateResult = await supabase
        .from('health_declarations')
        .update({
          token,
          form_status: 'pending',
          submission_date: null,
          notes: null
        })
        .eq('id', existingResult.data[0].id)
        .select('id');
        
      if (updateResult.error) {
        console.error('Error updating health declaration with new token:', updateResult.error);
        throw updateResult.error;
      }
      
      if (!updateResult.data || updateResult.data.length === 0) {
        throw new Error('No data returned when updating health declaration');
      }
      
      declarationId = updateResult.data[0].id;
    } else {
      // Create new declaration
      const newDeclaration = {
        participant_id: participantId, // Use participant_id from the registration
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
      
      if (insertResult.error) {
        console.error('Error creating health declaration:', insertResult.error);
        throw insertResult.error;
      }
      
      if (!insertResult.data || insertResult.data.length === 0) {
        throw new Error('No data returned when creating health declaration');
      }
      
      declarationId = insertResult.data[0].id;
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
