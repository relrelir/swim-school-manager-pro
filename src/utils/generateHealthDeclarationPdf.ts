
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/use-toast";
import * as htmlToImage from 'html-to-image';
import { jsPDF } from 'jspdf';
import { toPng } from 'html-to-image';

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
      // Create a virtual health declaration in the DOM
      const virtualDeclaration = document.createElement('div');
      virtualDeclaration.style.width = '800px';
      virtualDeclaration.style.padding = '40px';
      virtualDeclaration.style.fontFamily = 'Arial, sans-serif';
      virtualDeclaration.style.direction = 'rtl';
      virtualDeclaration.style.backgroundColor = 'white';
      virtualDeclaration.style.position = 'fixed';
      virtualDeclaration.style.left = '-9999px';
      
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
      
      // Build declaration HTML - this could be extracted to a helper method
      virtualDeclaration.innerHTML += `
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="font-size: 28px; margin-bottom: 10px;">הצהרת בריאות</h1>
          <p style="font-size: 14px; color: #666;">${new Date().toLocaleDateString('he-IL')}</p>
        </div>
        
        <div style="margin-bottom: 30px; border: 1px solid #eee; padding: 15px; border-radius: 5px;">
          <h3 style="font-size: 18px; margin-bottom: 15px;">פרטי המשתתף:</h3>
          <p><span style="font-weight: bold;">שם מלא:</span> ${participant.firstname} ${participant.lastname}</p>
          <p><span style="font-weight: bold;">ת.ז.:</span> ${participant.idnumber || ''}</p>
          <p><span style="font-weight: bold;">טלפון:</span> ${participant.phone || ''}</p>
        </div>
        
        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 18px; margin-bottom: 15px;">הצהרה:</h3>
          <div style="border: 1px solid #eee; padding: 15px; border-radius: 5px;">
            <p>• המשתתף נמצא/ת בכושר ובמצב בריאותי תקין המאפשר השתתפות בפעילות.</p>
            <p>• לא ידוע לי על מגבלות רפואיות המונעות להשתתף בפעילות.</p>
            <p>• לא ידוע לי על רגישויות, מחלות או בעיות רפואיות אחרות שעלולות להשפיע על ההשתתפות בפעילות.</p>
            <p>• אני מתחייב/ת להודיע למדריכים על כל שינוי במצבו הבריאותי.</p>
          </div>
        </div>
        
        ${healthDeclaration.notes ? `
        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 18px; margin-bottom: 15px;">הערות רפואיות:</h3>
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
      
      // Wait for the fonts to load properly before generating image
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log("HTML element created and appended, waiting for image conversion");
      
      // Convert the HTML to image with better error handling
      let dataUrl;
      try {
        dataUrl = await toPng(virtualDeclaration, { 
          quality: 1.0,
          width: 800,
          height: 1200,
          backgroundColor: 'white',
          skipAutoScale: true,
          pixelRatio: 2, // Higher resolution
          cacheBust: true // Avoid caching issues
        });
        console.log("HTML converted to image successfully");
      } catch (imageError) {
        console.error("Error during HTML to image conversion:", imageError);
        throw new Error('שגיאה בהמרת HTML לתמונה');
      }
      
      // Remove the temporary element
      document.body.removeChild(virtualDeclaration);
      
      // Create a PDF with the image
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      // Add the image to the PDF
      const imgWidth = pdf.internal.pageSize.getWidth();
      const imgHeight = (1200 * imgWidth) / 800; // Maintain aspect ratio
      
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
