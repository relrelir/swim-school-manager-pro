
import { createContext } from 'react';
import { HealthDeclaration } from '@/types';

export interface HealthDeclarationsContextType {
  healthDeclarations: HealthDeclaration[];
  addHealthDeclaration: (healthDeclaration: Omit<HealthDeclaration, 'id'>) => Promise<HealthDeclaration | undefined>;
  updateHealthDeclaration: (id: string, updates: Partial<HealthDeclaration>) => Promise<void>;
  getHealthDeclarationForRegistration: (registrationId: string) => HealthDeclaration | undefined;
  loading: boolean;
}

export const HealthDeclarationsContext = createContext<HealthDeclarationsContextType | null>(null);
