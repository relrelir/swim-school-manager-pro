
import pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import type { TDocumentDefinitions } from 'pdfmake/interfaces';

// Initialize pdfMake with the default fonts
// Fix TypeScript errors by correctly typing and accessing the vfs
(pdfMake as any).vfs = (pdfFonts as any).pdfMake?.vfs || {};

// Use the built-in Helvetica font for now, which supports basic Hebrew characters
// We'll switch to proper Hebrew font when available
(pdfMake as any).fonts = {
  ...(pdfMake as any).fonts,
  Helvetica: {
    normal: 'Helvetica',
    bold: 'Helvetica-Bold',
    italics: 'Helvetica',
    bolditalics: 'Helvetica-Bold',
  },
};

// Define global document defaults
export const pdfDocumentDefaults = {
  defaultStyle: {
    font: 'Helvetica',
    rtl: true,
    alignment: 'right',
  },
};

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
    ...pdfDocumentDefaults,
    ...docDefinition,
  } as TDocumentDefinitions; // Cast to avoid TypeScript error with rightToLeft

  try {
    // Create the PDF document
    const pdf = pdfMake.createPdf(fullDocDefinition);

    if (download && typeof window !== 'undefined') {
      // Download or open the PDF directly
      // This is more reliable than our previous approach
      return new Promise<void>((resolve, reject) => {
        try {
          pdf.download(fileName);
          resolve();
        } catch (error) {
          console.error("Error downloading PDF:", error);
          reject(error);
        }
      });
    } else {
      // For server-side rendering or when download is not needed
      return new Promise<Buffer>((resolve, reject) => {
        try {
          pdf.getBuffer((buffer: Buffer) => {
            resolve(buffer);
          });
        } catch (error) {
          console.error("Error generating PDF buffer:", error);
          reject(error);
        }
      });
    }
  } catch (error) {
    console.error("Error creating PDF:", error);
    throw error; // Re-throw to be caught by the caller
  }
};
