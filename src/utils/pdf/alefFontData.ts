
import { jsPDF } from 'jspdf';

// Function to configure jsPDF for Hebrew text support with Alef font
export const configureHebrewFont = async (pdf: jsPDF): Promise<void> => {
  try {
    console.log("Configuring PDF for Hebrew text support with Alef font");
    
    // Don't set global RTL mode - we'll handle per text element
    // This change is important for correct table handling
    pdf.setR2L(false);
    
    // Load TTF fonts directly from public directory
    const fontBaseUrl = '/fonts/'; // This points to the public/fonts directory
    
    // Register Alef Regular font
    console.log("Adding Alef Regular font from", `${fontBaseUrl}Alef-Regular.ttf`);
    await pdf.addFont(`${fontBaseUrl}Alef-Regular.ttf`, 'Alef', 'normal');
    
    // Register Alef Bold font
    console.log("Adding Alef Bold font from", `${fontBaseUrl}Alef-Bold.ttf`);
    await pdf.addFont(`${fontBaseUrl}Alef-Bold.ttf`, 'Alef', 'bold');
    
    // Use Alef font that properly supports Hebrew characters
    pdf.setFont('Alef');
    
    // Add PDF metadata with Hebrew titles
    pdf.setProperties({
      title: 'הצהרת בריאות',
      subject: 'הצהרת בריאות',
      creator: 'מערכת ניהול'
    });
    
    // Set font size for better readability with Hebrew text
    pdf.setFontSize(14);
    
    // Set line height for better spacing with Hebrew text
    // @ts-ignore - property exists but might not be in types
    if (pdf.setLineHeightFactor) {
      pdf.setLineHeightFactor(1.5);
    }
    
    // Set text color to ensure better contrast
    pdf.setTextColor(0, 0, 0);
    
    console.log("Hebrew font configuration applied with Alef font support");
  } catch (error) {
    console.error("Error configuring Alef font:", error);
    // Fallback to basic configuration with standard font
    pdf.setR2L(false);
    pdf.setFont('helvetica');
    console.warn("Falling back to helvetica font due to error");
    
    // Re-throw for debugging
    throw new Error(`Failed to configure Hebrew font: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
