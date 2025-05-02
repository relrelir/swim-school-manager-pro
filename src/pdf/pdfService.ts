
import * as pdfMake from "pdfmake/build/pdfmake";
import * as vfsFonts from "pdfmake/build/vfs_fonts";
import type { TDocumentDefinitions, Content, StyleDictionary } from "pdfmake/interfaces";

// Initialize pdfMake with the fonts
try {
  if (vfsFonts && typeof vfsFonts === 'object') {
    if ('pdfMake' in vfsFonts) {
      const pdfMakeProp = vfsFonts.pdfMake as Record<string, any>;
      if ('vfs' in pdfMakeProp) {
        (pdfMake as any).vfs = pdfMakeProp.vfs;
      }
    } else if ('vfs' in vfsFonts) {
      (pdfMake as any).vfs = vfsFonts.vfs;
    } else {
      console.error('VFS not found in expected vfsFonts structure');
    }
  }
} catch (e) {
  console.error('Error initializing pdfMake fonts:', e);
}

// Set up the font configuration
(pdfMake as any).fonts = {
  Roboto: {
    normal: 'Roboto-Regular.ttf',
    bold: 'Roboto-Bold.ttf',
    italics: 'Roboto-Italic.ttf',
    bolditalics: 'Roboto-BoldItalic.ttf'
  },
  // Hebrew support font added
  NotoHebrew: {
    normal: 'NotoSansHebrew-Regular.ttf',
    // Using the same font for all styles to prevent errors
    bold: 'NotoSansHebrew-Regular.ttf',
    italics: 'NotoSansHebrew-Regular.ttf',
    bolditalics: 'NotoSansHebrew-Regular.ttf'
  }
};

/**
 * Create and download/return a PDF
 * @param docDef PDF document definition
 * @param fileName Filename for download
 * @param download True to download in browser, false to return Buffer/Blob
 */
export async function makePdf(
  docDef: Partial<TDocumentDefinitions>,
  fileName: string,
  download = true
): Promise<void | Blob> {
  try {
    // Set default styles and orientation
    const definition: TDocumentDefinitions = {
      content: docDef.content || [],
      defaultStyle: { 
        font: "NotoHebrew", // Use Hebrew font by default
        alignment: 'right'  // Right alignment for RTL text
      },
      ...docDef, // Merge all other properties
      // Add RTL support through text direction
      pageOrientation: 'portrait',
      // Info property for document metadata
      info: {
        ...(docDef.info || {})
      }
    };
    
    // For Hebrew support, we need to correctly handle RTL
    // Create a plain object to add the rtl property which isn't in the TypeScript definitions
    const pdfDefinition = { ...definition };
    
    // Add RTL support by casting to any to avoid TypeScript errors
    (pdfDefinition as any).rtl = true;
    
    console.log("Creating PDF with RTL and Hebrew support", fileName);
    
    // Create the PDF
    const pdf = pdfMake.createPdf(pdfDefinition);
    
    if (download) {
      // Use the open method instead of download for more reliable functionality
      return new Promise<void>((resolve, reject) => {
        try {
          // Force immediate download by opening in new window with download attribute
          pdf.open({}, window);
          console.log("PDF opened for download:", fileName);
          resolve();
        } catch (error) {
          console.error("Error opening PDF:", error);
          reject(error);
        }
      });
    } else {
      return new Promise<Blob>((resolve, reject) => {
        pdf.getBlob((blob) => {
          console.log("PDF blob created successfully");
          resolve(blob);
        });
      });
    }
  } catch (error) {
    console.error("Error creating PDF:", error);
    throw new Error(`Failed to create PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Helper function for creating table data
export const createTableData = (
  headers: string[],
  rows: (string | number)[][]
) => {
  return {
    table: {
      headerRows: 1,
      widths: Array(headers.length).fill('*'),
      body: [
        headers.map(header => ({ 
          text: header, 
          style: 'tableHeader',
          alignment: 'right'
        })),
        ...rows.map(row => 
          row.map(cell => ({ 
            text: String(cell), 
            alignment: 'right'
          }))
        )
      ]
    },
    layout: 'lightHorizontalLines',
  };
};
