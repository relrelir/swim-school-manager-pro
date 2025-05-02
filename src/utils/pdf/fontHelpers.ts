
/**
 * Helper functions for font handling in PDFs
 */

// Export font definition for pdfMake
export const getFontDefinition = () => {
  return {
    Roboto: {
      normal: 'Roboto-Regular.ttf',
      bold: 'Roboto-Bold.ttf',
      italics: 'Roboto-Italic.ttf',
      bolditalics: 'Roboto-BoldItalic.ttf'
    }
  };
};

// Check if browser supports Hebrew characters
export const browserSupportsHebrew = (): boolean => {
  try {
    // Create a canvas element for font testing
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;
    
    // Test with a Hebrew character
    ctx.font = '16px Arial';
    const hebrewChar = 'א';
    const width = ctx.measureText(hebrewChar).width;
    
    // If width is very small, the font probably doesn't render Hebrew properly
    return width > 0;
  } catch (error) {
    console.error('Error checking Hebrew support:', error);
    return false;
  }
};

// Function to log font diagnostic information
export const logFontDiagnostics = (): void => {
  console.log('Font diagnostic information:');
  console.log('- User agent:', navigator.userAgent);
  console.log('- Platform:', navigator.platform);
  console.log('- Language:', navigator.language);
  
  if (document.fonts && document.fonts.check) {
    console.log('- System fonts available:');
    ['Arial', 'Times New Roman', 'David', 'Noto Sans Hebrew'].forEach(font => {
      console.log(`  - ${font}: ${document.fonts.check('16px ' + font)}`);
    });
  } else {
    console.log('- Font checking API not available');
  }
  
  console.log('- Hebrew support:', browserSupportsHebrew());
};
