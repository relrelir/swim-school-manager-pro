
// This file registers Hebrew fonts with pdfMake

// Import the default fonts
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

// Setup the default fonts - with proper error handling
try {
  if (pdfFonts && typeof pdfFonts === 'object') {
    if ('pdfMake' in pdfFonts && pdfFonts.pdfMake && 'vfs' in pdfFonts.pdfMake) {
      pdfMake.vfs = pdfFonts.pdfMake.vfs;
    } else if ('vfs' in pdfFonts) {
      pdfMake.vfs = pdfFonts.vfs;
    } else if ('default' in pdfFonts && pdfFonts.default && 'vfs' in pdfFonts.default) {
      pdfMake.vfs = pdfFonts.default.vfs;
    } else {
      console.error('Could not initialize pdfMake fonts. VFS object structure unexpected:', 
        Object.keys(pdfFonts).join(', '));
    }
  } else {
    console.error('Could not initialize pdfMake fonts. pdfFonts import is invalid.');
  }
} catch (error) {
  console.error('Error initializing pdfMake fonts:', error);
}

// Function to register additional fonts when needed
export const registerHebrewFonts = () => {
  // When custom Hebrew fonts are added, they would be registered here
  console.log("Hebrew font support initialized");
  
  // Example for future implementation:
  // if custom Hebrew fonts are added to the project:
  // pdfMake.vfs['MyHebrewFont.ttf'] = hebrewFontBase64Data;
  // pdfMake.fonts = {
  //   ...pdfMake.fonts,
  //   'HebrewFont': {
  //     normal: 'MyHebrewFont.ttf',
  //     bold: 'MyHebrewFont-Bold.ttf'
  //   }
  // };
  
  return true;
};

// Register fonts immediately
registerHebrewFonts();
