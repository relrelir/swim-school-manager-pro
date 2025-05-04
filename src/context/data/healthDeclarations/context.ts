
import { HealthDeclaration } from '@/types';
import React from 'react';

export interface HealthDeclarationsContextType {
  healthDeclarations: HealthDeclaration[];
  addHealthDeclaration: (healthDeclaration: Omit<HealthDeclaration, 'id'>) => Promise<HealthDeclaration | undefined>;
  updateHealthDeclaration: (id: string, updates: Partial<HealthDeclaration>) => Promise<void>;
  getHealthDeclarationForRegistration: (registrationId: string) => Promise<HealthDeclaration | undefined>;
  loading: boolean;
}

export const HealthDeclarationsContext = React.createContext<HealthDeclarationsContextType | null>(null);
