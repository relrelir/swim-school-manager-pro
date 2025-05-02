
/**
 * Utility functions for handling Hebrew text in PDFs
 */

// Helper function to ensure Hebrew text renders correctly
export const prepareHebrewText = (text: string): string => {
  if (!text) return '';
  
  // No special processing needed with pdfMake's RTL support
  // Just return the text directly
  return text;
};

// Helper function to create content with proper Hebrew alignment
export const createHebrewContent = (text: string, options: any = {}): any => {
  return {
    text,
    alignment: 'right',
    ...options
  };
};

// Helper function for RTL text in tables
export const createHebrewTableCell = (text: string): any => {
  return {
    text,
    alignment: 'right'
  };
};
