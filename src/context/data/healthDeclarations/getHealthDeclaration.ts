
import { HealthDeclaration } from '@/types';
import { mapHealthDeclarationFromDB } from './mappers';
import { 
  getHealthDeclarationByTokenRaw, 
  getHealthDeclarationByIdRaw 
} from './getHealthDeclarationRaw.js';

/**
 * Get a health declaration by its ID
 */
export const getHealthDeclarationById = async (id: string): Promise<HealthDeclaration | null> => {
  try {
    const rawDeclaration = await getHealthDeclarationByIdRaw(id);
    
    if (!rawDeclaration) {
      return null;
    }
    
    return mapHealthDeclarationFromDB(rawDeclaration);
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
    const rawDeclaration = await getHealthDeclarationByTokenRaw(token);
    
    if (!rawDeclaration) {
      return null;
    }
    
    return mapHealthDeclarationFromDB(rawDeclaration);
  } catch (error) {
    console.error('Error getting health declaration by token:', error);
    return null;
  }
};
