
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
    },
    NotoHebrew: {
      normal: 'NotoSansHebrew-Regular.ttf'
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

// Function to log PDF font information
export const logFontDiagnostics = (): void => {
  console.log('PDF font diagnostic information:');
  
  try {
    // Check for pdfMake global
    if (typeof window !== 'undefined') {
      // Check if pdfMake exists on window
      const pdfMakeExists = typeof (window as any).pdfMake !== 'undefined';
      console.log('- pdfMake loaded:', pdfMakeExists);
      
      // Try to import pdfMake dynamically to check if it's available
      import('pdfmake/build/pdfmake').then(pdfMakeModule => {
        console.log('- pdfMake imported successfully');
        
        // Check if vfs exists on the imported module
        const importedPdfMake = pdfMakeModule.default || pdfMakeModule;
        if (importedPdfMake && 'vfs' in importedPdfMake) {
          console.log('- Virtual file system available');
          
          // Check for Hebrew font
          const vfs = (importedPdfMake as any).vfs;
          if (vfs && 'NotoSansHebrew-Regular.ttf' in vfs) {
            console.log('- Hebrew font found in VFS');
          } else {
            console.log('- Hebrew font NOT found in VFS');
          }
        } else {
          console.log('- Virtual file system NOT available');
        }
      }).catch(err => {
        console.error('- Error importing pdfMake:', err);
      });
      
      // Log browser Hebrew support
      console.log('- Hebrew support:', browserSupportsHebrew());
    } else {
      console.log('- Running in server environment - browser information unavailable');
    }
  } catch (e) {
    console.error('Font diagnostics error in pdfMake check:', e);
  }
};
