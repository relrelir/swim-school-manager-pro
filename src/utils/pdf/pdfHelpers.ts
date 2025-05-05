
// Export all PDF helpers from their respective modules
// This maintains backward compatibility while having a more modular structure

// Core PDF functions
export {
  createPdf,
  addPdfTitle,
  addPdfDate,
  addSectionTitle
} from './core/index';

// Content detection helpers
export {
  isCurrencyCell,
  isEnglishOrNumber,
  isNumberOnly,
  isDateFormat,
  isPhoneFormat,
  isHebrewCurrency,
  containsHebrew
} from './helpers/contentDetection';

// Text direction and encoding helpers
export {
  processTextDirection,
  forceLtrDirection,
  forceRtlDirection,
  manuallyReverseString,
  processTableCellText,
  processHebrewCurrencyForTable,
  encodeHebrewText,
  reverseText,
  prepareRtlText
} from './helpers/textDirection';

// Table creation helpers
export {
  processCellContent,
  createDataTable,
  createPlainTextTable
} from './helpers/tableHelpers';

// Export the legacy function 'containsHebrew' directly as an alias
// to maintain backward compatibility with any code using hebrewTextHelper.ts
export { containsHebrew as containsHebrewText } from './helpers/contentDetection';
