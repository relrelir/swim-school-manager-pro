
// This is now the main entry point for PDF functionality
// The file has been refactored to import specialized modules

import { makePdf, pdfDocumentDefaults } from './core/pdfCore';
import { createRegistrationPdfDefinition } from './definitions/registrationPdfDefinition';
import { createHealthDeclarationPdfDefinition } from './definitions/healthDeclarationPdfDefinition';

// Re-export the functions to maintain the same public API
export {
  makePdf,
  pdfDocumentDefaults,
  createRegistrationPdfDefinition,
  createHealthDeclarationPdfDefinition
};
