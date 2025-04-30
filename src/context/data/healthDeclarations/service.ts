
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/use-toast";
import { HealthDeclaration } from '@/types';
import { mapHealthDeclarationFromDB, mapHealthDeclarationToDB } from './mappers';
import { handleSupabaseError } from '../utils';
import { v4 as uuidv4 } from 'uuid';
import type { PostgrestResponse } from '@supabase/supabase-js';

export const fetchHealthDeclarations = async (): Promise<HealthDeclaration[]> => {
  try {
    // Breaking down the query chain and using explicit typing
    const response: PostgrestResponse<any> = await supabase
      .from('health_declarations')
      .select('*');

    const { data, error } = response;

    if (error) {
      handleSupabaseError(error, 'fetching health declarations');
      return [];
    }

    if (data) {
      // Transform data to match our HealthDeclaration type
      return data.map(declaration => mapHealthDeclarationFromDB(declaration));
    }
    
    return [];
  } catch (error) {
    console.error('Error loading health declarations:', error);
    toast({
      title: "שגיאה",
      description: "אירעה שגיאה בטעינת הצהרות בריאות",
      variant: "destructive",
    });
    return [];
  }
};

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

export const updateHealthDeclarationService = async (id: string, updates: Partial<HealthDeclaration>) => {
  try {
    const dbUpdates = mapHealthDeclarationToDB(updates);
    
    console.log('Updating health declaration with id:', id, 'and data:', dbUpdates);
    
    // Breaking down the query chain and using explicit typing
    const response: PostgrestResponse<any> = await supabase
      .from('health_declarations')
      .update(dbUpdates)
      .eq('id', id);
    
    const { error } = response;

    if (error) {
      console.error('Supabase error during health declaration update:', error);
      handleSupabaseError(error, 'updating health declaration');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error updating health declaration:', error);
    toast({
      title: "שגיאה",
      description: "אירעה שגיאה בעדכון הצהרת בריאות",
      variant: "destructive",
    });
    throw error;
  }
};

// Add a new function to submit a completed health form
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
    
    if (!data || data.length === 0 || !data[0].participant_id) {
      throw new Error('Failed to retrieve registration data after form submission');
    }
    
    // Return the participant_id (registrationId) for further processing
    return data[0].participant_id;
  } catch (error) {
    console.error('Error submitting health form:', error);
    throw error;
  }
};

// Get a health declaration by its ID
export const getHealthDeclarationById = async (id: string): Promise<HealthDeclaration | null> => {
  try {
    // Breaking down the query chain and using explicit typing
    const response: PostgrestResponse<any> = await supabase
      .from('health_declarations')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
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

// Get a health declaration by its token
export const getHealthDeclarationByToken = async (token: string): Promise<HealthDeclaration | null> => {
  try {
    // Breaking down the query chain and using explicit typing
    const response: PostgrestResponse<any> = await supabase
      .from('health_declarations')
      .select('*')
      .eq('token', token)
      .maybeSingle();
    
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

// Create a health declaration link
export const createHealthDeclarationLink = async (registrationId: string): Promise<string | null> => {
  try {
    // Generate a unique token
    const token = uuidv4();
    
    // Check if a declaration already exists for this registration
    const existingResponse: PostgrestResponse<any> = await supabase
      .from('health_declarations')
      .select('id, form_status')
      .eq('participant_id', registrationId)
      .maybeSingle();
    
    const { data: existingData, error: existingError } = existingResponse;
    
    if (existingError && existingError.code !== 'PGRST116') { // PGRST116 is "No rows found"
      console.error('Error checking existing declaration:', existingError);
      throw existingError;
    }
    
    let declarationId: string;
    
    if (existingData) {
      // Update existing declaration with new token
      const updateResponse: PostgrestResponse<any> = await supabase
        .from('health_declarations')
        .update({
          token,
          form_status: 'pending',
          submission_date: null,
          notes: null
        })
        .eq('id', existingData.id);
        
      const { error: updateError } = updateResponse;
        
      if (updateError) {
        console.error('Error updating health declaration with new token:', updateError);
        throw updateError;
      }
      
      declarationId = existingData.id;
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
      
      const insertResponse: PostgrestResponse<any> = await supabase
        .from('health_declarations')
        .insert(newDeclaration)
        .select('id');
      
      const { data: newData, error: insertError } = insertResponse;
        
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
