// This file re-exports everything from the tables directory for backward compatibility
export * from './tables';

// Import our new formatPdfField function
import { formatPdfField } from './textFormatting';
import { createDataTable } from './tables/dataTable';
import { createPlainTextTable } from './tables/plainTextTable';

// Export the necessary functions
export {
  createDataTable,
  createPlainTextTable,
  formatPdfField
};
