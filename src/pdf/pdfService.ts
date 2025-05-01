
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import type { TDocumentDefinitions } from "pdfmake/interfaces";

// Initialize with the default fonts
pdfMake.vfs = pdfFonts.pdfMake.vfs;

// Add Noto Sans Hebrew font to virtual file system
// We use URL encoding for browser environments that don't have access to the file system
const addNotoHebrewFont = () => {
  // In browser environments, we load the font from the public directory
  if (typeof window !== 'undefined') {
    // Create a link to load the font
    const fontLoader = document.createElement('link');
    fontLoader.rel = 'preload';
    fontLoader.href = '/fonts/NotoSansHebrew-Regular.ttf';
    fontLoader.as = 'font';
    fontLoader.type = 'font/ttf';
    fontLoader.crossOrigin = 'anonymous';
    document.head.appendChild(fontLoader);
    
    // Use fetch to get the font file
    fetch('/fonts/NotoSansHebrew-Regular.ttf')
      .then(response => response.arrayBuffer())
      .then(fontData => {
        // Convert ArrayBuffer to base64 string
        const base64 = arrayBufferToBase64(fontData);
        // Add font to vfs
        pdfMake.vfs['NotoSansHebrew-Regular.ttf'] = base64;
        
        // Register the font
        pdfMake.fonts = {
          ...pdfMake.fonts,
          NotoHebrew: {
            normal: 'NotoSansHebrew-Regular.ttf',
            bold: 'NotoSansHebrew-Regular.ttf',
            italics: 'NotoSansHebrew-Regular.ttf',
            bolditalics: 'NotoSansHebrew-Regular.ttf',
          }
        };
        
        console.log('Noto Sans Hebrew font loaded successfully');
      })
      .catch(err => {
        console.error('Failed to load Noto Sans Hebrew font:', err);
      });
  }
};

// Helper function to convert ArrayBuffer to base64 string
const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  
  return window.btoa(binary);
};

// Initialize the font
addNotoHebrewFont();

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
  // Set default RTL and font
  const definition: TDocumentDefinitions = {
    pageDirection: 'rtl',
    defaultStyle: { font: 'NotoHebrew' },
    ...docDef
  };

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
