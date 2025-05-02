
/**
 * Utility to help convert fonts to base64 for embedding in PDFs
 * 
 * NOTE: This is a browser-side utility that should be run once to generate
 * the base64 representation of the font file, which can then be copied
 * into alefFontData.ts
 */

/**
 * Converts a font file to base64 string
 * @param fontUrl URL to the font file
 * @returns Promise with the base64 string
 */
export async function convertFontToBase64(fontUrl: string): Promise<string> {
  console.log(`Converting font to base64: ${fontUrl}`);
  
  try {
    // Fetch the font file
    const response = await fetch(fontUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch font: ${response.statusText}`);
    }
    
    // Get the font file as an array buffer
    const fontBuffer = await response.arrayBuffer();
    
    // Convert to base64
    const base64 = arrayBufferToBase64(fontBuffer);
    
    console.log('Font converted to base64 successfully');
    return base64;
  } catch (error) {
    console.error('Error converting font to base64:', error);
    throw error;
  }
}

/**
 * Converts ArrayBuffer to base64 string
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const len = bytes.byteLength;
  
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  
  return window.btoa(binary);
}

/**
 * Usage example:
 * 
 * In browser console or in a component:
 * 
 * ```
 * import { convertFontToBase64 } from './fontHelper';
 * 
 * // Call this function to convert the font to base64
 * async function generateAlefFontBase64() {
 *   const base64 = await convertFontToBase64('/fonts/Alef-Regular.ttf');
 *   console.log('Copy this base64 string into alefFontData.ts:');
 *   console.log(base64);
 * }
 * 
 * generateAlefFontBase64();
 * ```
 * 
 * Then copy the output and replace the placeholder in alefFontData.ts
 */
