
import { toast } from "@/components/ui/use-toast";
import { makePdf } from '@/pdf/pdfService';
import { fetchRegistrationData } from './pdf/registration/registrationDataFetcher';
import { buildRegistrationContent } from './pdf/registration/registrationContentBuilder';

/**
 * Generates a registration PDF from registration ID
 */
export const generateRegistrationPdf = async (registrationId: string) => {
  try {
    console.log("Starting registration PDF generation for ID:", registrationId);
    
    // Step 1: Fetch all required data
    const { registration, participant, payments } = await fetchRegistrationData(registrationId);
    
    console.log("Data fetched successfully, creating PDF content...");
    
    // Step 2: Build PDF content structure
    const { content, styles, fileName } = buildRegistrationContent(
      registration,
      participant, 
      payments
    );
    
    // Step 3: Generate and download the PDF
    console.log("Generating registration PDF with file name:", fileName);
    await makePdf({ content, styles }, fileName);
    
    console.log("PDF generated successfully");
    toast({
      title: "PDF נוצר בהצלחה",
      description: "אישור הרישום נשמר במכשיר שלך",
    });
    
    return fileName;
  } catch (error) {
    console.error('Error generating registration PDF:', error);
    toast({
      title: "שגיאה",
      description: error instanceof Error ? error.message : 'אירעה שגיאה ביצירת ה-PDF',
      variant: "destructive",
    });
    throw error;
  }
};
