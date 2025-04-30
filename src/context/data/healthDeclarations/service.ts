
// Re-export all health declarations service functions
import { fetchHealthDeclarations } from './fetchHealthDeclarations';
import { addHealthDeclarationService } from './addHealthDeclaration';
import { updateHealthDeclarationService } from './updateHealthDeclaration';
import { submitHealthFormService } from './submitHealthForm';
import { getHealthDeclarationById, getHealthDeclarationByToken } from './getHealthDeclaration';
import { createHealthDeclarationLink } from './createHealthDeclarationLink';

export {
  fetchHealthDeclarations,
  addHealthDeclarationService,
  updateHealthDeclarationService,
  submitHealthFormService,
  getHealthDeclarationById,
  getHealthDeclarationByToken,
  createHealthDeclarationLink
};
