
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

// Function to log PDF font information
export const logFontDiagnostics = (): void => {
  console.log('PDF font diagnostic information:');
  
  try {
    // Check for pdfMake global
    if (typeof window !== 'undefined') {
      // @ts-ignore - pdfMake might be on window
      const pdfMakeExists = !!window.pdfMake;
      console.log('- pdfMake loaded:', pdfMakeExists);
      
      // Try to import pdfMake dynamically to check if it's available
      import('pdfmake/build/pdfmake').then(pdfMakeModule => {
        console.log('- pdfMake imported successfully');
        
        // Check if vfs exists on the imported module
        const importedPdfMake = pdfMakeModule.default || pdfMakeModule;
        if (importedPdfMake && 'vfs' in importedPdfMake) {
          console.log('- Virtual file system available');
        } else {
          console.log('- Virtual file system NOT available');
        }
      }).catch(err => {
        console.error('- Error importing pdfMake:', err);
      });
      
      // Check for vfs_fonts
      import('pdfmake/build/vfs_fonts').then(vfsFontsModule => {
        const vfsFonts = vfsFontsModule.default || vfsFontsModule;
        
        if (vfsFonts && typeof vfsFonts === 'object') {
          if ('vfs' in vfsFonts) {
            console.log('- VFS fonts available through direct vfs property');
          } else if (vfsFonts.pdfMake && vfsFonts.pdfMake.vfs) {
            console.log('- VFS fonts available through pdfMake.vfs property');
          } else {
            console.log('- VFS fonts structure in unexpected format:', Object.keys(vfsFonts));
          }
        } else {
          console.log('- VFS fonts structure MISSING');
        }
      }).catch(err => {
        console.error('- Error importing vfs_fonts:', err);
      });
    }
  } catch (e) {
    console.error('Font diagnostics error in pdfMake check:', e);
  }
  
  // Log browser information
  if (typeof navigator !== 'undefined') {
    console.log('- User agent:', navigator.userAgent);
    console.log('- Platform:', navigator.platform);
    console.log('- Language:', navigator.language);
    
    // Test system fonts if font API is available
    if (document.fonts && document.fonts.check) {
      console.log('- System fonts available:');
      ['Arial', 'Times New Roman', 'David', 'Noto Sans Hebrew'].forEach(font => {
        console.log(`  - ${font}: ${document.fonts.check('16px ' + font)}`);
      });
    } else {
      console.log('- Font checking API not available');
    }
    
    console.log('- Hebrew support:', browserSupportsHebrew());
  } else {
    console.log('- Running in server environment - browser information unavailable');
  }
};
