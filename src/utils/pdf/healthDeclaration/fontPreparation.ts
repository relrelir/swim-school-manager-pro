
import { ensureAssistantFontLoaded, testFontRendering } from '../hebrewPdfConfig';

/**
 * Prepare fonts for document generation
 * This function ensures the Assistant font is properly loaded before PDF generation
 */
export const prepareFonts = async (): Promise<HTMLElement> => {
  console.log("Starting font preparation process for PDF generation");
  
  // Ensure the Assistant font is loaded
  await ensureAssistantFontLoaded();
  await document.fonts.ready;
  
  // Log available fonts for troubleshooting
  console.log("Available fonts:", Array.from(document.fonts).map(f => `${f.family} (${f.status})`));
  
  // Create a test element to force font rendering
  const testElement = testFontRendering();
  
  // Extra wait to ensure the font has been properly rendered
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return testElement;
};
