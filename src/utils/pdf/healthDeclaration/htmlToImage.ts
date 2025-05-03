
import { toPng } from 'html-to-image';

export interface HtmlToImageOptions {
  quality?: number;
  width?: number;
  height?: number;
  pixelRatio?: number;
  skipAutoScale?: boolean;
  cacheBust?: boolean;
  canvasWidth?: number;
  canvasHeight?: number;
  useCORS?: boolean;
  imagePlaceholder?: string;
  fontEmbedCSS?: string;
}

/**
 * Convert HTML element to image with improved settings for RTL and Hebrew support
 */
export const convertHtmlToImage = async (
  element: HTMLElement,
  options?: HtmlToImageOptions
): Promise<string> => {
  console.log("Starting HTML to image conversion...");
  
  try {
    // Apply default options with good settings for Hebrew text
    const defaultOptions = {
      quality: 0.95,
      width: 800,
      height: 1200,
      backgroundColor: 'white',
      skipAutoScale: true, 
      pixelRatio: 5, // Higher resolution for better quality
      cacheBust: true, // Avoid caching issues
      canvasWidth: 4000, // 5x the width for higher resolution
      canvasHeight: 6000, // 5x the height for higher resolution
      style: {
        fontFamily: 'Assistant, Arial, sans-serif',
        direction: 'rtl',
      },
      useCORS: true, // Try to use CORS for external resources
      ...options
    };
    
    const dataUrl = await toPng(element, defaultOptions);
    console.log("HTML converted to image successfully, dataUrl length:", dataUrl?.length || 0);
    
    return dataUrl;
  } catch (error) {
    console.error("Error during HTML to image conversion:", error);
    throw new Error(`שגיאה בהמרת HTML לתמונה: ${error}`);
  }
};

/**
 * Save debug image for troubleshooting
 */
export const saveDebugImage = (dataUrl: string, id: string): void => {
  try {
    const debugLink = document.createElement('a');
    debugLink.download = `debug_health_declaration_${id.substring(0, 8)}.png`;
    debugLink.href = dataUrl;
    debugLink.style.display = 'none';
    document.body.appendChild(debugLink);
    debugLink.click();
    document.body.removeChild(debugLink);
    console.log("Debug image saved");
  } catch (debugError) {
    console.error("Could not save debug image:", debugError);
  }
};
