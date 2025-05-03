
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/use-toast";
import { jsPDF } from 'jspdf';
import { toPng } from 'html-to-image';
import { configureHebrewFont, ensureAssistantFontLoaded, testFontRendering } from './pdf/hebrewPdfConfig';

export const generateHealthDeclarationPdf = async (healthDeclarationId: string) => {
  try {
    console.log("Starting health declaration PDF generation for declaration ID:", healthDeclarationId);
    
    if (!healthDeclarationId) {
      console.error("Health declaration ID is missing or invalid");
      throw new Error('מזהה הצהרת הבריאות חסר או לא תקין');
    }
    
    // Get the health declaration directly by ID
    let { data: healthDeclaration, error: healthDeclarationError } = await supabase
      .from('health_declarations')
      .select('id, participant_id, submission_date, notes, form_status')
      .eq('id', healthDeclarationId)
      .single();
    
    if (healthDeclarationError || !healthDeclaration) {
      console.error("Health declaration not found by ID:", healthDeclarationError, healthDeclarationId);
      throw new Error('הצהרת בריאות לא נמצאה');
    }
    
    console.log("Found health declaration:", healthDeclaration);
    
    // Get participant details - use participant_id from the health declaration
    const { data: participant, error: participantError } = await supabase
      .from('participants')
      .select('firstname, lastname, idnumber, phone')
      .eq('id', healthDeclaration.participant_id)
      .single();
    
    if (participantError || !participant) {
      console.error("Participant details not found:", participantError);
      throw new Error('פרטי המשתתף לא נמצאו');
    }
    
    console.log("Data fetched successfully. Participant:", participant);
    
    try {
      // Ensure the Assistant font is loaded with improved loading mechanism
      console.log("Starting font loading process...");
      await ensureAssistantFontLoaded();
      await document.fonts.ready;
      
      console.log("Available fonts:", Array.from(document.fonts).map(f => `${f.family} (${f.status})`));
      
      // Create a test element to force font rendering
      const testElement = testFontRendering();
      
      // Create a hidden but visible (in DOM) virtual declaration
      console.log("Creating virtual declaration element");
      const virtualDeclaration = document.createElement('div');
      virtualDeclaration.id = 'virtual-health-declaration';
      virtualDeclaration.style.width = '800px';
      virtualDeclaration.style.height = '1200px';
      virtualDeclaration.style.padding = '40px';
      virtualDeclaration.style.position = 'fixed';
      virtualDeclaration.style.top = '0';
      virtualDeclaration.style.left = '0';
      virtualDeclaration.style.zIndex = '-9999';
      virtualDeclaration.style.visibility = 'hidden'; // Hidden but still rendered
      virtualDeclaration.style.overflow = 'visible';
      virtualDeclaration.style.backgroundColor = 'white';
      virtualDeclaration.style.fontFamily = 'Assistant, Arial, sans-serif';
      virtualDeclaration.style.direction = 'rtl';
      
      // Explicitly set font style to ensure it loads
      const style = document.createElement('style');
      style.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Assistant:wght@400;700&display=swap');
        
        /* Direct font embedding */
        @font-face {
          font-family: 'Assistant';
          src: url('https://fonts.gstatic.com/s/assistant/v18/2sDPZGJYnIjSi6H75xkZZE1I0yCmYzzQtuZnIGSV35Gu.woff2') format('woff2');
          font-weight: normal;
          font-style: normal;
          font-display: swap;
          unicode-range: U+0590-05FF, U+200C-2010, U+20AA, U+25CC, U+FB1D-FB4F;
        }
        
        #virtual-health-declaration * {
          font-family: 'Assistant', Arial, sans-serif !important;
          direction: rtl;
        }
        
        #virtual-health-declaration h1, 
        #virtual-health-declaration h2, 
        #virtual-health-declaration h3, 
        #virtual-health-declaration p,
        #virtual-health-declaration div {
          font-family: 'Assistant', Arial, sans-serif !important;
          direction: rtl;
        }
      `;
      virtualDeclaration.appendChild(style);
      
      // Build declaration HTML with improved styling
      virtualDeclaration.innerHTML += `
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="font-size: 28px; margin-bottom: 10px; font-family: Assistant, Arial, sans-serif !important; direction: rtl;">הצהרת בריאות</h1>
          <p style="font-size: 14px; color: #666; font-family: Assistant, Arial, sans-serif !important;">${new Date().toLocaleDateString('he-IL')}</p>
        </div>
        
        <div style="margin-bottom: 30px; border: 1px solid #eee; padding: 15px; border-radius: 5px;">
          <h3 style="font-size: 18px; margin-bottom: 15px; font-family: Assistant, Arial, sans-serif !important; direction: rtl;">פרטי המשתתף:</h3>
          <p style="font-family: Assistant, Arial, sans-serif !important; direction: rtl;"><span style="font-weight: bold;">שם מלא:</span> ${participant.firstname} ${participant.lastname}</p>
          <p style="font-family: Assistant, Arial, sans-serif !important; direction: rtl;"><span style="font-weight: bold;">ת.ז.:</span> ${participant.idnumber || ''}</p>
          <p style="font-family: Assistant, Arial, sans-serif !important; direction: rtl;"><span style="font-weight: bold;">טלפון:</span> ${participant.phone || ''}</p>
        </div>
        
        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 18px; margin-bottom: 15px; font-family: Assistant, Arial, sans-serif !important; direction: rtl;">הצהרה:</h3>
          <div style="border: 1px solid #eee; padding: 15px; border-radius: 5px;">
            <p style="margin-bottom: 8px; font-family: Assistant, Arial, sans-serif !important; direction: rtl;">• המשתתף נמצא/ת בכושר ובמצב בריאותי תקין המאפשר השתתפות בפעילות.</p>
            <p style="margin-bottom: 8px; font-family: Assistant, Arial, sans-serif !important; direction: rtl;">• לא ידוע לי על מגבלות רפואיות המונעות להשתתף בפעילות.</p>
            <p style="margin-bottom: 8px; font-family: Assistant, Arial, sans-serif !important; direction: rtl;">• לא ידוע לי על רגישויות, מחלות או בעיות רפואיות אחרות שעלולות להשפיע על ההשתתפות בפעילות.</p>
            <p style="margin-bottom: 8px; font-family: Assistant, Arial, sans-serif !important; direction: rtl;">• אני מתחייב/ת להודיע למדריכים על כל שינוי במצבו הבריאותי.</p>
          </div>
        </div>
        
        ${healthDeclaration.notes ? `
        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 18px; margin-bottom: 15px; font-family: Assistant, Arial, sans-serif !important; direction: rtl;">הערות רפואיות:</h3>
          <p style="font-family: Assistant, Arial, sans-serif !important; direction: rtl;">${healthDeclaration.notes}</p>
        </div>
        ` : ''}
        
        <div style="margin-top: 40px; border-top: 1px solid #ccc; padding-top: 20px;">
          <div style="margin-bottom: 30px;">
            <p style="font-weight: bold; margin-bottom: 5px; font-family: Assistant, Arial, sans-serif !important; direction: rtl;">חתימת ההורה/אפוטרופוס:</p>
            <div style="height: 40px; border-bottom: 1px dashed #999; width: 250px;"></div>
          </div>
          
          <div>
            <p style="font-weight: bold; margin-bottom: 5px; font-family: Assistant, Arial, sans-serif !important; direction: rtl;">תאריך:</p>
            <div style="height: 40px; border-bottom: 1px dashed #999; width: 120px;"></div>
          </div>
        </div>
      `;
      
      // Append to the document body
      document.body.appendChild(virtualDeclaration);
      
      // Wait longer for the fonts to load and the element to render
      console.log("Waiting for rendering to complete (4000ms)...");
      await new Promise(resolve => setTimeout(resolve, 4000));
      console.log("Render wait complete, proceeding to image conversion");
      
      // Verify the font is loaded again just before conversion
      const assistantFontLoaded = Array.from(document.fonts).some(font => 
        font.family.includes('Assistant') && font.status === 'loaded'
      );
      console.log("Final Assistant font loaded check:", assistantFontLoaded);
      
      // Convert the HTML to image with improved settings
      console.log("Starting HTML to image conversion...");
      let dataUrl;
      try {
        dataUrl = await toPng(virtualDeclaration, { 
          quality: 0.95,
          width: 800,
          height: 1200,
          backgroundColor: 'white',
          skipAutoScale: true,
          pixelRatio: 5, // Higher resolution for better quality
          cacheBust: true, // Avoid caching issues
          canvasWidth: 4000, // 5x the width for higher resolution
          canvasHeight: 6000, // 5x the height for higher resolution
          fontEmbedCSS: document.querySelector('style')?.textContent || '',
          style: {
            fontFamily: 'Assistant, Arial, sans-serif',
            direction: 'rtl',
          },
          // Additional settings to help with rendering issues
          allowTaint: true, // Allow cross-origin images
          useCORS: true, // Try to use CORS for external resources
          imagePlaceholder: undefined, // No placeholder for missing images
        });
        console.log("HTML converted to image successfully, dataUrl length:", dataUrl?.length || 0);
        
        // For debugging: save the image separately
        try {
          const debugLink = document.createElement('a');
          debugLink.download = `debug_health_declaration_${healthDeclarationId.substring(0, 8)}.png`;
          debugLink.href = dataUrl;
          debugLink.style.display = 'none';
          document.body.appendChild(debugLink);
          debugLink.click();
          document.body.removeChild(debugLink);
          console.log("Debug image saved");
        } catch (debugError) {
          console.error("Could not save debug image:", debugError);
        }
      } catch (imageError) {
        console.error("Error during HTML to image conversion:", imageError);
        throw new Error(`שגיאה בהמרת HTML לתמונה: ${imageError}`);
      } finally {
        // Remove the temporary elements
        document.body.removeChild(virtualDeclaration);
        document.body.removeChild(testElement);
      }
      
      if (!dataUrl || dataUrl.length < 1000) {
        console.error("Generated image is invalid or too small");
        throw new Error('התמונה שנוצרה אינה תקינה');
      }
      
      // Create a PDF with the image
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      // Configure Hebrew font
      configureHebrewFont(pdf);
      
      // Add the image to the PDF
      const imgWidth = pdf.internal.pageSize.getWidth();
      const imgHeight = (1200 * imgWidth) / 800; // Maintain aspect ratio
      
      console.log("Adding image to PDF with dimensions:", { imgWidth, imgHeight });
      pdf.addImage(dataUrl, 'PNG', 0, 0, imgWidth, imgHeight);
      
      // Generate filename
      const fileName = `health_declaration_${participant.firstname}_${participant.lastname}_${healthDeclaration.id.substring(0, 8)}.pdf`;
      
      // Save the PDF
      pdf.save(fileName);
      console.log("PDF saved successfully");
      
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
