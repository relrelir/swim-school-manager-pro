
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';

// Helper function to generate unique IDs
export const generateId = (): string => {
  return uuidv4();
};

// Helper for error handling with toasts
export const handleSupabaseError = (error: any, operation: string): void => {
  console.error(`Error ${operation}:`, error);
  throw new Error(`${operation} failed: ${error.message}`);
};
