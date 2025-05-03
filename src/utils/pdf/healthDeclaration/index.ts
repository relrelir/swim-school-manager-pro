
import { toast } from "@/components/ui/use-toast";
import { fetchHealthDeclarationData } from './dataFetcher';
import { prepareFonts } from './fontPreparation';
import { generateHealthDeclarationHtml } from './htmlTemplating';
import { convertHtmlToImage, saveDebugImage } from './htmlToImage';
import { generatePdfFromImage } from './pdfGenerator';

/**
 * Main function to generate a health declaration PDF
 */
export const generateHealthDeclarationPdf = async (healthDeclarationId: string): Promise<string> => {
  try {
    console.log("Starting health declaration PDF generation process for ID:", healthDeclarationId);
    
    // Fetch required data
    const { healthDeclaration, participant, notes } = await fetchHealthDeclarationData(healthDeclarationId);
    
    try {
      // Ensure fonts are loaded properly
      const testElement = await prepareFonts();
      
      // Generate HTML content
      const virtualDeclaration = generateHealthDeclarationHtml(participant, healthDeclaration, notes);
      document.body.appendChild(virtualDeclaration);
      
      // Wait for rendering to complete
      console.log("Waiting for rendering to complete (4000ms)...");
      await new Promise(resolve => setTimeout(resolve, 4000));
      
      // Final font check
      const assistantFontLoaded = Array.from(document.fonts).some(font => 
        font.family.includes('Assistant') && font.status === 'loaded'
      );
      console.log("Final Assistant font loaded check:", assistantFontLoaded);
      
      // Convert HTML to image
      const dataUrl = await convertHtmlToImage(virtualDeclaration, {
        fontEmbedCSS: document.querySelector('style')?.textContent || '',
      });
      
      // For debugging: save the image separately
      saveDebugImage(dataUrl, healthDeclarationId);
      
      // Clean up temporary elements
      document.body.removeChild(virtualDeclaration);
      document.body.removeChild(testElement);
      
      // Validate the image data
      if (!dataUrl || dataUrl.length < 1000) {
        console.error("Generated image is invalid or too small");
        throw new Error('התמונה שנוצרה אינה תקינה');
      }
      
      // Generate PDF from image
      const participantName = `${participant.firstname}_${participant.lastname}`;
      const fileName = generatePdfFromImage(dataUrl, participantName, healthDeclaration.id);
      
      // Show success message
      toast({
        title: "PDF נוצר בהצלחה",
        description: "הצהרת הבריאות נשמרה במכשיר שלך",
      });
      
      return fileName;
    } catch (error) {
      console.error('Error during PDF generation:', error);
      toast({
        variant: "destructive",
        title: "שגיאה ביצירת PDF",
        description: "נא לנסות שוב מאוחר יותר",
      });
      throw new Error('אירעה שגיאה ביצירת מסמך ה-PDF');
    }
  } catch (error) {
    console.error('Error in generateHealthDeclarationPdf:', error);
    toast({
      title: "שגיאה",
      description: error instanceof Error ? error.message : 'אירעה שגיאה ביצירת ה-PDF',
      variant: "destructive",
    });
    throw error;
  }
};
