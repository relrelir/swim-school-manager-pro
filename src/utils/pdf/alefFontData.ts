import { jsPDF } from 'jspdf';

/**
 * Type definitions for font configuration
 */
interface FontConfig {
  rtl: boolean;
  fontName: string;
  properties?: {
    title?: string;
    subject?: string;
    creator?: string;
  };
  fontSize?: number;
  textColor?: [number, number, number];
}

/**
 * Configure jsPDF instance for Hebrew text support
 * @param pdf - jsPDF instance to configure
 * @param config - Optional configuration overrides
 */
export const configureHebrewFont = (
  pdf: jsPDF, 
  config?: Partial<FontConfig>
): void => {
  try {
    console.log("Configuring PDF for Hebrew text support");
    
    // Default configuration
    const defaultConfig: FontConfig = {
      rtl: true,
      fontName: 'helvetica',
      properties: {
        title: 'הצהרת בריאות',
        subject: 'הצהרת בריאות',
        creator: 'מערכת ניהול'
      },
      fontSize: 14,
      textColor: [0, 0, 0]
    };
    
    // Merge with provided overrides
    const finalConfig = { ...defaultConfig, ...config };
    
    // Set RTL mode for Hebrew text direction
    pdf.setR2L(finalConfig.rtl);
    
    // Set font
    pdf.setFont(finalConfig.fontName);
    
    // Set PDF properties
    if (finalConfig.properties) {
      pdf.setProperties(finalConfig.properties);
    }
    
    // Set font size and formatting
    if (finalConfig.fontSize) {
      pdf.setFontSize(finalConfig.fontSize);
    }
    
    if (finalConfig.textColor) {
      pdf.setTextColor(...finalConfig.textColor);
    }
    
    console.log("Hebrew font configuration applied with RTL support");
  } catch (error) {
    console.error("Error configuring Hebrew font:", error);
    // Fallback to basic configuration
    pdf.setR2L(true);
    pdf.setFont('helvetica');
  }
};

/**
 * Base64 representation of the Alef font
 * This is a minimal placeholder - replace with actual base64 font data
 * Use the fontHelper utility to convert the font file to base64
 */
export const alefFontBase64: string = "AAEC"; // Minimal valid base64 string

/**
 * Instructions for implementing the font:
 * 
 * 1. Use the fontHelper utility to convert the Alef-Regular.ttf file to base64:
 *    - Import { convertFontToBase64 } from './fontHelper'
 *    - Call convertFontToBase64('/fonts/Alef-Regular.ttf')
 *    - Copy the resulting base64 string
 * 
 * 2. Replace the placeholder above with the actual base64 string
 * 
 * 3. The font will be automatically embedded in PDFs when available
 */
