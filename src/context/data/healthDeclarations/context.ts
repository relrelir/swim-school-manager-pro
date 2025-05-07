
import { HealthDeclaration } from '@/types';

export interface HealthDeclarationsContextType {
  healthDeclarations: HealthDeclaration[];
  addHealthDeclaration: (declaration: Omit<HealthDeclaration, 'id'>) => Promise<HealthDeclaration | undefined>;
  updateHealthDeclaration: (id: string, declaration: Partial<HealthDeclaration>) => Promise<HealthDeclaration | undefined>;
  deleteHealthDeclaration: (id: string) => Promise<void>;
  getHealthDeclarationForRegistration: (registrationId: string) => Promise<HealthDeclaration | undefined>;
  createHealthDeclarationLink: (registrationId: string) => Promise<string | undefined>;
  getHealthDeclarationByToken: (token: string) => Promise<HealthDeclaration | undefined>;
  loading: boolean;
}

export const HealthDeclarationsContext = React.createContext<HealthDeclarationsContextType | null>(null);
