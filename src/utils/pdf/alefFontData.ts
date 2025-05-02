
import { jsPDF } from 'jspdf';

/**
 * Alef font base64 data
 * This will be populated at runtime when font loading is triggered
 */
let alefFontBase64: string | null = null;

/**
 * Function to configure jsPDF with embedded Alef font for Hebrew text support
 */
export const configureHebrewFont = async (pdf: jsPDF): Promise<void> => {
  try {
    console.log("Configuring PDF for Hebrew text support with Alef font");
    
    // Load the font if not already loaded
    if (!alefFontBase64) {
      console.log("Loading Alef font from public/fonts/Alef-Regular.ttf");
      
      try {
        // Fetch the font file from the public directory
        const fontResponse = await fetch('/fonts/Alef-Regular.ttf');
        if (!fontResponse.ok) {
          throw new Error(`Failed to load font: ${fontResponse.status} ${fontResponse.statusText}`);
        }
        
        // Convert the font file to ArrayBuffer
        const fontArrayBuffer = await fontResponse.arrayBuffer();
        
        // Convert ArrayBuffer to Base64
        const fontBase64 = arrayBufferToBase64(fontArrayBuffer);
        
        // Store the font data
        alefFontBase64 = fontBase64;
        console.log("Alef font loaded successfully");
      } catch (fontError) {
        console.error("Error loading Alef font:", fontError);
        throw fontError;
      }
    }
    
    // Add the Alef font to the PDF - this is specific to jsPDF's font handling
    pdf.addFileToVFS('Alef-Regular.ttf', alefFontBase64);
    pdf.addFont('Alef-Regular.ttf', 'Alef', 'normal');
    
    // Set RTL mode and use the Alef font
    pdf.setR2L(true);
    pdf.setFont('Alef');
    
    // Add PDF metadata with Hebrew titles
    pdf.setProperties({
      title: 'הצהרת בריאות',
      subject: 'הצהרת בריאות',
      creator: 'מערכת ניהול'
    });
    
    // Increase font size for better readability with Hebrew text
    pdf.setFontSize(14);
    
    // Set line height for better spacing with Hebrew text
    // @ts-ignore - property exists but might not be in types
    if (pdf.setLineHeightFactor) {
      pdf.setLineHeightFactor(1.5);
    }
    
    // Set text color to ensure better contrast
    pdf.setTextColor(0, 0, 0);
    
    console.log("Hebrew font configuration applied with RTL support and Alef font");
  } catch (error) {
    console.error("Error configuring Hebrew font:", error);
    // Fallback to basic configuration
    pdf.setR2L(true);
    pdf.setFont('helvetica');
    throw new Error(`Font configuration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Helper function to convert ArrayBuffer to Base64 string
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  
  return window.btoa(binary);
}
