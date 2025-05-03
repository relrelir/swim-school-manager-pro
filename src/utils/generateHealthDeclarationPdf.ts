
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/use-toast";
import { jsPDF } from 'jspdf';
import { toPng } from 'html-to-image';
import { configureHebrewFont } from './pdf/hebrewPdfConfig';

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
      // Load the Assistant font
      await document.fonts.ready;
      console.log("Available fonts:", Array.from(document.fonts).map(f => f.family));
      
      // Create a virtual health declaration in the DOM - ensure it's visible while rendering
      const virtualDeclaration = document.createElement('div');
      virtualDeclaration.style.width = '800px';
      virtualDeclaration.style.height = '1200px';
      virtualDeclaration.style.padding = '40px';
      virtualDeclaration.style.fontFamily = 'Assistant, Arial, sans-serif';
      virtualDeclaration.style.direction = 'rtl';
      virtualDeclaration.style.backgroundColor = 'white';
      virtualDeclaration.style.position = 'absolute';
      virtualDeclaration.style.top = '0';
      virtualDeclaration.style.left = '-2000px'; // Still off-screen but not too far
      virtualDeclaration.style.zIndex = '-1000';
      virtualDeclaration.style.overflow = 'visible';
      
      // Explicitly set font style to ensure it loads
      const style = document.createElement('style');
      style.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Assistant:wght@400;700&display=swap');
        * {
          font-family: 'Assistant', Arial, sans-serif !important;
        }
        p, h1, h2, h3 {
          font-family: 'Assistant', Arial, sans-serif !important;
        }
      `;
      virtualDeclaration.appendChild(style);
      
      // Build declaration HTML with more reliable styling
      virtualDeclaration.innerHTML += `
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="font-size: 28px; margin-bottom: 10px; font-family: Assistant, Arial, sans-serif;">הצהרת בריאות</h1>
          <p style="font-size: 14px; color: #666;">${new Date().toLocaleDateString('he-IL')}</p>
        </div>
        
        <div style="margin-bottom: 30px; border: 1px solid #eee; padding: 15px; border-radius: 5px;">
          <h3 style="font-size: 18px; margin-bottom: 15px; font-family: Assistant, Arial, sans-serif;">פרטי המשתתף:</h3>
          <p><span style="font-weight: bold;">שם מלא:</span> ${participant.firstname} ${participant.lastname}</p>
          <p><span style="font-weight: bold;">ת.ז.:</span> ${participant.idnumber || ''}</p>
          <p><span style="font-weight: bold;">טלפון:</span> ${participant.phone || ''}</p>
        </div>
        
        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 18px; margin-bottom: 15px; font-family: Assistant, Arial, sans-serif;">הצהרה:</h3>
          <div style="border: 1px solid #eee; padding: 15px; border-radius: 5px;">
            <p style="margin-bottom: 8px;">• המשתתף נמצא/ת בכושר ובמצב בריאותי תקין המאפשר השתתפות בפעילות.</p>
            <p style="margin-bottom: 8px;">• לא ידוע לי על מגבלות רפואיות המונעות להשתתף בפעילות.</p>
            <p style="margin-bottom: 8px;">• לא ידוע לי על רגישויות, מחלות או בעיות רפואיות אחרות שעלולות להשפיע על ההשתתפות בפעילות.</p>
            <p style="margin-bottom: 8px;">• אני מתחייב/ת להודיע למדריכים על כל שינוי במצבו הבריאותי.</p>
          </div>
        </div>
        
        ${healthDeclaration.notes ? `
        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 18px; margin-bottom: 15px; font-family: Assistant, Arial, sans-serif;">הערות רפואיות:</h3>
          <p>${healthDeclaration.notes}</p>
        </div>
        ` : ''}
        
        <div style="margin-top: 40px; border-top: 1px solid #ccc; padding-top: 20px;">
          <div style="margin-bottom: 30px;">
            <p style="font-weight: bold; margin-bottom: 5px;">חתימת ההורה/אפוטרופוס:</p>
            <div style="height: 40px; border-bottom: 1px dashed #999; width: 250px;"></div>
          </div>
          
          <div>
            <p style="font-weight: bold; margin-bottom: 5px;">תאריך:</p>
            <div style="height: 40px; border-bottom: 1px dashed #999; width: 120px;"></div>
          </div>
        </div>
      `;
      
      // Append to the document body to render properly
      document.body.appendChild(virtualDeclaration);
      
      // Wait longer for the fonts to load properly before generating image
      console.log("HTML element created and appended, waiting for font loading...");
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log("Font loading wait complete, proceeding to image conversion");
      
      // Add a specific check for the Assistant font
      const assistantFontLoaded = Array.from(document.fonts).some(font => 
        font.family.includes('Assistant') && font.status === 'loaded'
      );
      console.log("Assistant font loaded:", assistantFontLoaded);
      
      // Convert the HTML to image with better error handling and higher quality settings
      let dataUrl;
      try {
        console.log("Starting HTML to image conversion...");
        dataUrl = await toPng(virtualDeclaration, { 
          quality: 0.95,
          width: 800,
          height: 1200,
          backgroundColor: 'white',
          skipAutoScale: true,
          pixelRatio: 3, // Higher resolution for better quality
          cacheBust: true, // Avoid caching issues
          canvasWidth: 2400, // 3x the width for higher resolution
          canvasHeight: 3600, // 3x the height for higher resolution
          style: {
            margin: '0',
            padding: '40px',
            fontFamily: 'Assistant, Arial, sans-serif',
          },
        });
        console.log("HTML converted to image successfully, dataUrl length:", dataUrl?.length || 0);
      } catch (imageError) {
        console.error("Error during HTML to image conversion:", imageError);
        throw new Error(`שגיאה בהמרת HTML לתמונה: ${imageError}`);
      }
      
      // Remove the temporary element
      document.body.removeChild(virtualDeclaration);
      
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
