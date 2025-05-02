
// This file registers Hebrew fonts with pdfMake

// Import the default fonts
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

// Setup the default fonts
pdfMake.vfs = pdfFonts.pdfMake.vfs;

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
