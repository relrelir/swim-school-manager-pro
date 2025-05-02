
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import type { TDocumentDefinitions, Content, StyleDictionary } from "pdfmake/interfaces";
import { logFontDiagnostics } from '../utils/pdf/fontHelpers';

// Initialize pdfMake with the fonts
// Handle different pdfFonts structures for better compatibility
try {
  if (pdfFonts && typeof pdfFonts === 'object') {
    // Handle the different ways pdfFonts might expose the VFS
    if ('pdfMake' in pdfFonts && pdfFonts.pdfMake && 'vfs' in pdfFonts.pdfMake) {
      pdfMake.vfs = pdfFonts.pdfMake.vfs;
    } else if ('vfs' in pdfFonts) {
      pdfMake.vfs = pdfFonts.vfs;
    } else {
      console.error('VFS not found in expected pdfFonts structure');
    }
  } else {
    console.error('pdfFonts import is not in expected format');
  }
} catch (e) {
  console.error('Error initializing pdfMake fonts:', e);
}

// Run font diagnostics in development
if (process.env.NODE_ENV !== 'production') {
  try {
    logFontDiagnostics();
  } catch (e) {
    console.error('Font diagnostics error:', e);
  }
}

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
      pageOrientation: 'portrait',
      defaultStyle: { 
        font: 'Roboto',
        alignment: 'right', // Default alignment for RTL text
        ...(docDef.defaultStyle || {})
      },
      content: docDef.content || [],
      ...docDef, // Merge all other properties
    };
    
    // Set RTL direction for Hebrew language support using the correct property
    // The rtl property needs to be set differently based on pdfMake version
    if ('pageDirection' in definition) {
      // Modern pdfMake versions use pageDirection
      // @ts-ignore - Using pageDirection for newer versions  
      definition.pageDirection = 'rtl';
    } else if ('rightToLeft' in definition) {
      // Some versions use rightToLeft
      // @ts-ignore - Using rightToLeft for some versions
      definition.rightToLeft = true;
    } else {
      // For older versions we use the standard way
      // @ts-ignore - Using rtl for backwards compatibility
      definition.rtl = true;
    }
    
    console.log("Creating PDF with RTL support");
    
    // Create the PDF
    const pdf = pdfMake.createPdf(definition);
    
    if (download) {
      pdf.download(fileName);
      return;
    } else {
      return new Promise<Blob>((resolve) => {
        pdf.getBlob((blob) => resolve(blob));
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
    layout: {
      hLineWidth: (i: number, node: any) => (i === 0 || i === node.table.body.length) ? 1 : 1,
      vLineWidth: () => 1,
      hLineColor: () => '#CCCCCC',
      vLineColor: () => '#CCCCCC',
    }
  };
};
