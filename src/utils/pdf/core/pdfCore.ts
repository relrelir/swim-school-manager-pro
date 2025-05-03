
import pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import type { TDocumentDefinitions } from 'pdfmake/interfaces';
import { alefFontBase64 } from '../alefFontData';

// Initialize pdfMake with the default fonts
// Fix TypeScript errors by correctly typing and accessing the vfs
(pdfMake as any).vfs = (pdfFonts as any).pdfMake?.vfs || {};

// Add the Alef font to pdfMake's virtual file system
if (alefFontBase64) {
  // Only add if we have valid base64 data
  (pdfMake as any).vfs['Alef-Regular.ttf'] = alefFontBase64;

  // Register the font
  (pdfMake as any).fonts = {
    ...(pdfMake as any).fonts,
    Alef: {
      normal: 'Alef-Regular.ttf',
      bold: 'Alef-Regular.ttf',
      italics: 'Alef-Regular.ttf',
      bolditalics: 'Alef-Regular.ttf',
    },
  };
}

/**
 * Helper function to create and download a PDF
 * @param docDefinition The PDF document definition
 * @param fileName The name for the downloaded file
 * @param download Whether to download the file or return a promise
 * @returns A promise that resolves when the download is complete
 */
export const makePdf = async (
  docDefinition: Partial<TDocumentDefinitions>,
  fileName: string,
  download = true
): Promise<void | Buffer> => {
  const fullDocDefinition: TDocumentDefinitions = {
    pageSize: 'A4',
    pageOrientation: 'portrait',
    pageMargins: [40, 60, 40, 60],
    defaultStyle: { font: alefFontBase64 ? 'Alef' : 'Helvetica' },
    // Use RTL layout for Hebrew
    rightToLeft: true,
    ...docDefinition,
  } as TDocumentDefinitions; // Cast to avoid TypeScript error with rightToLeft

  const pdf = pdfMake.createPdf(fullDocDefinition);

  if (download && typeof window !== 'undefined') {
    return new Promise<void>((resolve) => {
      pdf.getBlob((blob: Blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        resolve();
      });
    });
  } else {
    // For server-side rendering or when download is not needed
    return new Promise<Buffer>((resolve) => {
      pdf.getBuffer((buffer: Buffer) => {
        resolve(buffer);
      });
    });
  }
};
