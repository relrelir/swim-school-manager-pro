
import { toast } from "@/components/ui/use-toast";
import { makePdf } from '@/pdf/pdfService';
import { fetchHealthDeclarationData } from './pdf/healthDeclaration/healthDeclarationDataFetcher';
import { buildHealthDeclarationContent } from './pdf/healthDeclaration/healthDeclarationContentBuilder';

/**
 * Generates a health declaration PDF from a declaration ID
 * @param healthDeclarationId The ID of the health declaration
 * @returns The filename of the generated PDF
 */
export const generateHealthDeclarationPdf = async (healthDeclarationId: string): Promise<string> => {
  try {
    console.log("Starting health declaration PDF generation for declaration ID:", healthDeclarationId);
    
    if (!healthDeclarationId) {
      throw new Error("HealthDeclarationIdMissing");
    }
    
    // Step 1: Fetch all required data
    const healthDeclarationData = await fetchHealthDeclarationData(healthDeclarationId);
    
    console.log("Data fetched successfully, creating PDF content...");
    
    // Step 2: Build PDF content structure
    const { content, styles, fileName } = buildHealthDeclarationContent(healthDeclarationData);
    
    // Step 3: Generate and download the PDF
    console.log("Generating health declaration PDF with file name:", fileName);
    
    // Force download with a boolean parameter
    await makePdf({ content, styles }, fileName, true);
    
    console.log("PDF generated successfully");
    toast({
      title: "PDF נוצר בהצלחה",
      description: "הצהרת הבריאות נשמרה במכשיר שלך",
    });
    
    return fileName;
  } catch (error) {
    console.error('Error generating health declaration PDF:', error);
    
    // Determine error message based on error type
    let errorMessage = 'אירעה שגיאה ביצירת ה-PDF';
    if (error instanceof Error) {
      if (error.message === "הצהרת בריאות לא נמצאה" || error.message.includes("לא נמצא")) {
        errorMessage = error.message;
      } else if (error.message === "HealthDeclarationIdMissing") {
        errorMessage = "מזהה הצהרת הבריאות חסר";
      } else {
        errorMessage = `שגיאה: ${error.message}`;
      }
    }
    
    toast({
      title: "שגיאה",
      description: errorMessage,
      variant: "destructive",
    });
    
    throw error;
  }
};
