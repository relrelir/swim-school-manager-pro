
import { jsPDF } from 'jspdf';

// Function to configure jsPDF for Hebrew text support with proper fonts
export const configureHebrewFont = (pdf: jsPDF): void => {
  try {
    console.log("Configuring PDF for Hebrew text support");
    
    // Set RTL mode for Hebrew text direction
    pdf.setR2L(true);
    
    // Set properties for better Hebrew support
    pdf.setProperties({
      title: 'מסמך עברית',
      subject: 'מסמך עברית',
      creator: 'מערכת ניהול'
    });
    
    // Increase font size slightly for better readability with Hebrew text
    pdf.setFontSize(14);
    
    // Set line height for better spacing with Hebrew text
    // @ts-ignore - property exists but might not be in types
    if (pdf.setLineHeightFactor) {
      pdf.setLineHeightFactor(1.5);
    }
    
    // Set text color to ensure better contrast
    pdf.setTextColor(0, 0, 0);
    
    console.log("Hebrew font configuration applied with RTL support");
  } catch (error) {
    console.error("Error configuring Hebrew font:", error);
    // Fallback to basic configuration
    pdf.setR2L(true);
  }
}

// Helper function to prepare HTML content with Hebrew font support
export const prepareHebrewHtmlContent = (): string => {
  return `
    @font-face {
      font-family: 'Assistant';
      src: url('https://fonts.googleapis.com/css2?family=Assistant:wght@400;700&display=swap');
      font-weight: normal;
      font-style: normal;
    }
    
    * {
      font-family: 'Assistant', Arial, sans-serif !important;
    }
    
    @media print {
      body {
        direction: rtl;
      }
    }
  `;
}

// Function to check if Assistant font is loaded
export const checkAssistantFontLoaded = async (): Promise<boolean> => {
  // Wait for document fonts to be ready
  await document.fonts.ready;
  
  // Check if Assistant is in the list of loaded fonts
  return Array.from(document.fonts).some(font => 
    font.family.toLowerCase().includes('assistant') && font.status === 'loaded'
  );
}

// Function to load Assistant font if needed
export const ensureAssistantFontLoaded = async (): Promise<void> => {
  const isFontLoaded = await checkAssistantFontLoaded();
  
  if (!isFontLoaded) {
    console.log("Assistant font not detected, loading manually...");
    
    // Create a link element to load the font
    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Assistant:wght@400;700&display=swap';
    document.head.appendChild(fontLink);
    
    // Wait for the font to load
    await new Promise<void>(resolve => {
      fontLink.onload = () => {
        console.log("Assistant font loaded via link tag");
        resolve();
      };
      
      // Timeout in case the font doesn't load
      setTimeout(() => {
        console.log("Font load timeout reached, continuing anyway");
        resolve();
      }, 2000);
    });
  } else {
    console.log("Assistant font already loaded");
  }
}
