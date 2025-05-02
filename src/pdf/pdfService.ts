
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import type { TDocumentDefinitions, Content, StyleDictionary } from "pdfmake/interfaces";

// Initialize pdfMake with the fonts
pdfMake.vfs = pdfFonts.pdfMake.vfs;

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
  // Set default styles and orientation
  const definition: TDocumentDefinitions = {
    pageOrientation: 'portrait',
    defaultStyle: { 
      font: 'Roboto',
      ...(docDef.defaultStyle || {})
    },
    content: docDef.content || [],
    ...docDef, // Merge all other properties
  };
  
  // Add RTL support
  if (definition.defaultStyle) {
    definition.defaultStyle.alignment = 'right';
  }

  // Set page direction for RTL languages
  definition.rightToLeft = true;
  
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
