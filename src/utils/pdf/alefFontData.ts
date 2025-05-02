/**
 * Base64 encoded data for the Alef Hebrew font
 * This is embedded directly in the code rather than fetched at runtime
 */

// Base64 encoded content of the Alef-Regular.ttf font
// For production use, replace this placeholder with the actual base64 content of the font
export const alefFontBase64 = "AAEAAAARAQAABAAQR0RFRgBKAAsAAEcoAAAAKEdQT1Ot9CzsAABHUAAAAKxHU1VCgYz9ggAAR/wAAAAsT1MvMnXWXiQAADxUAAAAYFNUQVTl5MwmAABIKAAAAERjbWFwAcoBpQAAPLQAAABkZ2FzcAAAABAAAABMAAAACGdseWa5fZ7SAABAwAAAF3xoZWFkGNuI/wAAO/gAAAA2aGhlYQkaAhgAADwwAAAAJGhtdHgKPweQAAA8VAAAACR";

/**
 * Function to configure jsPDF with embedded Alef font for Hebrew text support
 * This uses the embedded base64 data instead of fetching the font file
 */
export const configureHebrewFont = (pdf: any): void => {
  try {
    console.log("Configuring PDF with embedded Hebrew font data");
    
    // Add the Alef font to the PDF
    pdf.addFileToVFS('Alef-Regular.ttf', alefFontBase64);
    pdf.addFont('Alef-Regular.ttf', 'Alef', 'normal');
    
    // Set RTL mode and use the Alef font
    pdf.setR2L(true);
    pdf.setFont('Alef');
    
    console.log("Hebrew font configuration completed successfully");
  } catch (error) {
    console.error("Error configuring Hebrew font:", error);
    // Fallback to basic configuration
    pdf.setR2L(true);
    pdf.setFont('helvetica');
    throw new Error(`Font configuration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
