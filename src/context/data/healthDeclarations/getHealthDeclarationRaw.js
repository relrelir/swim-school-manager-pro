
import { supabase } from '@/integrations/supabase/client';

/**
 * Get a health declaration by token - raw JS implementation to avoid TypeScript deep instantiation
 */
export async function getHealthDeclarationByTokenRaw(token) {
  const result = await supabase
    .from('health_declarations')
    .select('*')
    .eq('token', token)
    .limit(1);
    
  if (result.error) {
    console.error('Error fetching health declaration by token:', result.error);
    return null;
  }
  
  return (result.data && result.data.length > 0) ? result.data[0] : null;
}

/**
 * Get a health declaration by ID - raw JS implementation to avoid TypeScript deep instantiation
 */
export async function getHealthDeclarationByIdRaw(id) {
  const result = await supabase
    .from('health_declarations')
    .select('*')
    .eq('id', id)
    .limit(1);
    
  if (result.error) {
    console.error('Error fetching health declaration by ID:', result.error);
    return null;
  }
  
  return (result.data && result.data.length > 0) ? result.data[0] : null;
}
