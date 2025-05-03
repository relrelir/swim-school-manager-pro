
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

// Helper function to prepare HTML content with Hebrew font support - enhanced with @font-face
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
  const assistantLoaded = Array.from(document.fonts).some(font => 
    font.family.toLowerCase().includes('assistant') && font.status === 'loaded'
  );
  
  console.log("Assistant font loaded check:", assistantLoaded);
  return assistantLoaded;
}

// Function to load Assistant font if needed - with direct embedding
export const ensureAssistantFontLoaded = async (): Promise<void> => {
  const isFontLoaded = await checkAssistantFontLoaded();
  
  if (!isFontLoaded) {
    console.log("Assistant font not detected, loading in multiple ways...");
    
    // 1. Create a link element to load the font
    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Assistant:wght@400;700&display=swap';
    document.head.appendChild(fontLink);
    
    // 2. Add direct @font-face styling as a fallback
    const fontStyle = document.createElement('style');
    fontStyle.textContent = `
      /* Direct font embedding */
      @font-face {
        font-family: 'Assistant';
        src: url('https://fonts.gstatic.com/s/assistant/v18/2sDPZGJYnIjSi6H75xkZZE1I0yCmYzzQtuZnIGSV35Gu.woff2') format('woff2');
        font-weight: normal;
        font-style: normal;
        font-display: swap;
        unicode-range: U+0590-05FF, U+200C-2010, U+20AA, U+25CC, U+FB1D-FB4F;
      }
      
      /* Force all elements to use Assistant */
      * {
        font-family: 'Assistant', Arial, sans-serif !important;
      }
    `;
    document.head.appendChild(fontStyle);
    
    // 3. Create a test element with Hebrew text to force font loading
    const testElement = document.createElement('div');
    testElement.style.fontFamily = 'Assistant, Arial, sans-serif';
    testElement.style.position = 'absolute';
    testElement.style.top = '-9999px';
    testElement.style.fontSize = '20px';
    testElement.textContent = 'שלום עולם - טקסט עברי לטעינת הגופן';
    document.body.appendChild(testElement);
    
    // Wait for the font to load with a longer timeout
    console.log("Waiting for Assistant font to load...");
    await new Promise<void>(resolve => {
      // Use a font loading detector
      const checkFont = () => {
        if (Array.from(document.fonts).some(font => font.family.toLowerCase().includes('assistant') && font.status === 'loaded')) {
          console.log("Assistant font loaded successfully");
          resolve();
        } else {
          const remainingAttempts = 30;
          if (remainingAttempts > 0) {
            setTimeout(checkFont, 200); // Check every 200ms
          } else {
            console.log("Font load attempts exhausted, continuing anyway");
            resolve();
          }
        }
      };
      
      // Start checking
      setTimeout(checkFont, 200);
      
      // Safety timeout in case the font detection fails
      setTimeout(() => {
        console.log("Font load max timeout (6s) reached, continuing anyway");
        resolve();
      }, 6000);
    });
    
    // Clean up the test element
    document.body.removeChild(testElement);
    
    console.log("Font loading process completed");
  } else {
    console.log("Assistant font already loaded");
  }
}

// Function to create a test element to verify font rendering
export const testFontRendering = (): HTMLElement => {
  console.log("Creating font test element");
  const testElement = document.createElement('div');
  testElement.style.fontFamily = 'Assistant, Arial, sans-serif';
  testElement.style.position = 'absolute';
  testElement.style.top = '10px';
  testElement.style.right = '10px';
  testElement.style.zIndex = '-1';
  testElement.style.opacity = '0.01'; // Almost invisible but still rendered
  testElement.style.fontSize = '20px';
  testElement.style.direction = 'rtl';
  testElement.textContent = 'טקסט בדיקה עברי';
  
  document.body.appendChild(testElement);
  return testElement;
}
