
import { createContext } from 'react';
import { HealthDeclaration } from '@/types';

export interface HealthDeclarationsContextType {
  healthDeclarations: HealthDeclaration[];
  loading: boolean;
  addHealthDeclaration: (declaration: Omit<HealthDeclaration, 'id'>) => Promise<HealthDeclaration | undefined>;
  updateHealthDeclaration: (id: string, declaration: Partial<HealthDeclaration>) => Promise<HealthDeclaration | undefined>;
  deleteHealthDeclaration: (id: string) => Promise<void>;
  getHealthDeclarationForRegistration: (registrationId: string) => Promise<HealthDeclaration | undefined>;
  createHealthDeclarationLink: (registrationId: string) => Promise<string | undefined>;
  getHealthDeclarationByToken: (token: string) => Promise<HealthDeclaration | undefined>;
}

export const HealthDeclarationsContext = createContext<HealthDeclarationsContextType | undefined>(undefined);
