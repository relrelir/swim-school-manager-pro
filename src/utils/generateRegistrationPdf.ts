
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/use-toast";
import { Registration, Participant, Payment } from '@/types';
import { formatCurrency } from '@/utils/formatters';
import { format } from 'date-fns';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { configureHebrewFont, ensureAssistantFontLoaded, testFontRendering } from './pdf/hebrewPdfConfig';

export const generateRegistrationPdf = async (registrationId: string) => {
  try {
    console.log("Starting registration PDF generation for ID:", registrationId);
    
    // Get the registration details
    const { data: registration, error: registrationError } = await supabase
      .from('registrations')
      .select('*')
      .eq('id', registrationId)
      .single();
    
    if (registrationError || !registration) {
      console.error("Registration details not found:", registrationError);
      throw new Error('פרטי הרישום לא נמצאו');
    }
    
    // Get participant details
    const { data: participant, error: participantError } = await supabase
      .from('participants')
      .select('*')
      .eq('id', registration.participantid)
      .single();
    
    if (participantError || !participant) {
      console.error("Participant details not found:", participantError);
      throw new Error('פרטי המשתתף לא נמצאו');
    }
    
    // Get payment details
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('*')
      .eq('registrationid', registrationId)
      .order('paymentdate', { ascending: false });
    
    if (paymentsError) {
      console.error("Error loading payments:", paymentsError);
      throw new Error('אירעה שגיאה בטעינת פרטי התשלומים');
    }
    
    // Get product name
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('name')
      .eq('id', registration.productid)
      .single();
    
    if (productError || !product) {
      console.error("Product details not found:", productError);
      throw new Error('פרטי המוצר לא נמצאו');
    }
    
    console.log("Data fetched successfully, creating PDF...");
    
    // Adapt database fields to our Registration type
    const registrationData: Registration = {
      id: registration.id,
      productId: registration.productid,
      participantId: registration.participantid,
      registrationDate: registration.registrationdate,
      requiredAmount: registration.requiredamount,
      paidAmount: registration.paidamount,
      discountApproved: registration.discountapproved,
      discountAmount: registration.discountamount,
      receiptNumber: registration.receiptnumber
    };
    
    // Adapt database fields to our Participant type
    const participantData: Participant = {
      id: participant.id,
      firstName: participant.firstname,
      lastName: participant.lastname,
      idNumber: participant.idnumber,
      phone: participant.phone,
      healthApproval: participant.healthapproval
    };
    
    // Adapt database fields to our Payment type
    const paymentsData: Payment[] = payments ? payments.map(payment => ({
      id: payment.id,
      registrationId: payment.registrationid,
      paymentDate: payment.paymentdate,
      amount: payment.amount,
      receiptNumber: payment.receiptnumber
    })) : [];
    
    try {
      // Ensure Assistant font is loaded with improved loading mechanism
      console.log("Starting font loading process...");
      await ensureAssistantFontLoaded();
      await document.fonts.ready;
      
      console.log("Available fonts:", Array.from(document.fonts).map(f => `${f.family} (${f.status})`));
      
      // Create a test element to force font rendering
      const testElement = testFontRendering();
      
      // Create a visible (in DOM) but hidden virtual registration certificate
      console.log("Creating virtual registration element");
      const virtualRegistration = document.createElement('div');
      virtualRegistration.id = 'virtual-registration';
      virtualRegistration.style.width = '800px';
      virtualRegistration.style.height = '1100px';
      virtualRegistration.style.padding = '40px';
      virtualRegistration.style.position = 'fixed';
      virtualRegistration.style.top = '0';
      virtualRegistration.style.left = '0';
      virtualRegistration.style.zIndex = '-9999';
      virtualRegistration.style.visibility = 'hidden'; // Hidden but still rendered
      virtualRegistration.style.overflow = 'visible';
      virtualRegistration.style.backgroundColor = 'white';
      virtualRegistration.style.fontFamily = 'Assistant, Arial, sans-serif';
      virtualRegistration.style.direction = 'rtl';
      
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
        
        #virtual-registration * {
          font-family: 'Assistant', Arial, sans-serif !important;
          direction: rtl;
        }
        
        #virtual-registration h1, 
        #virtual-registration h2, 
        #virtual-registration h3, 
        #virtual-registration p,
        #virtual-registration div,
        #virtual-registration table,
        #virtual-registration th,
        #virtual-registration td {
          font-family: 'Assistant', Arial, sans-serif !important;
          direction: rtl;
        }
      `;
      virtualRegistration.appendChild(style);
      
      // Calculate effective required amount (after discount)
      const discountAmount = registrationData.discountAmount || 0;
      const effectiveRequiredAmount = Math.max(0, registrationData.requiredAmount - (registrationData.discountApproved ? discountAmount : 0));
      
      // Format current date for display
      const currentDate = format(new Date(), 'dd/MM/yyyy');
      
      // Build registration certificate HTML with embedded font styles
      virtualRegistration.innerHTML += `
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="font-size: 28px; margin-bottom: 10px; font-family: Assistant, Arial, sans-serif !important; direction: rtl;">אישור רישום למוצר</h1>
          <p style="font-size: 14px; color: #666; font-family: Assistant, Arial, sans-serif !important;">${currentDate}</p>
        </div>
        
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="font-size: 22px; font-family: Assistant, Arial, sans-serif !important; direction: rtl;">מוצר: ${product.name}</h2>
        </div>
        
        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 18px; margin-bottom: 15px; font-family: Assistant, Arial, sans-serif !important; direction: rtl;">פרטי משתתף:</h3>
          <div style="border: 1px solid #eee; padding: 15px; border-radius: 5px;">
            <p style="font-family: Assistant, Arial, sans-serif !important; direction: rtl;"><span style="font-weight: bold;">שם מלא:</span> ${participantData.firstName} ${participantData.lastName}</p>
            <p style="font-family: Assistant, Arial, sans-serif !important; direction: rtl;"><span style="font-weight: bold;">תעודת זהות:</span> ${participantData.idNumber || ''}</p>
            <p style="font-family: Assistant, Arial, sans-serif !important; direction: rtl;"><span style="font-weight: bold;">טלפון:</span> ${participantData.phone || ''}</p>
          </div>
        </div>
        
        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 18px; margin-bottom: 15px; font-family: Assistant, Arial, sans-serif !important; direction: rtl;">פרטי רישום:</h3>
          <div style="border: 1px solid #eee; padding: 15px; border-radius: 5px;">
            <p style="font-family: Assistant, Arial, sans-serif !important; direction: rtl;"><span style="font-weight: bold;">תאריך רישום:</span> ${format(new Date(registrationData.registrationDate), 'dd/MM/yyyy')}</p>
            <p style="font-family: Assistant, Arial, sans-serif !important; direction: rtl;"><span style="font-weight: bold;">סכום מקורי:</span> ${formatCurrency(registrationData.requiredAmount)}</p>
            <p style="font-family: Assistant, Arial, sans-serif !important; direction: rtl;"><span style="font-weight: bold;">הנחה:</span> ${registrationData.discountApproved ? formatCurrency(discountAmount) : 'לא'}</p>
            <p style="font-family: Assistant, Arial, sans-serif !important; direction: rtl;"><span style="font-weight: bold;">סכום לתשלום:</span> ${formatCurrency(effectiveRequiredAmount)}</p>
            <p style="font-family: Assistant, Arial, sans-serif !important; direction: rtl;"><span style="font-weight: bold;">סכום ששולם:</span> ${formatCurrency(registrationData.paidAmount)}</p>
          </div>
        </div>
        
        ${paymentsData.length > 0 ? `
          <div style="margin-bottom: 30px;">
            <h3 style="font-size: 18px; margin-bottom: 15px; font-family: Assistant, Arial, sans-serif !important; direction: rtl;">פרטי תשלומים:</h3>
            <div style="border: 1px solid #eee; padding: 15px; border-radius: 5px;">
              <table style="width: 100%; border-collapse: collapse; direction: rtl;">
                <thead>
                  <tr style="background-color: #f5f5f5;">
                    <th style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd; font-family: Assistant, Arial, sans-serif !important;">תאריך תשלום</th>
                    <th style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd; font-family: Assistant, Arial, sans-serif !important;">מספר קבלה</th>
                    <th style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd; font-family: Assistant, Arial, sans-serif !important;">סכום</th>
                  </tr>
                </thead>
                <tbody>
                  ${paymentsData.map(payment => `
                    <tr>
                      <td style="padding: 8px; text-align: right; border-bottom: 1px solid #eee; font-family: Assistant, Arial, sans-serif !important;">${format(new Date(payment.paymentDate), 'dd/MM/yyyy')}</td>
                      <td style="padding: 8px; text-align: right; border-bottom: 1px solid #eee; font-family: Assistant, Arial, sans-serif !important;">${payment.receiptNumber}</td>
                      <td style="padding: 8px; text-align: right; border-bottom: 1px solid #eee; font-family: Assistant, Arial, sans-serif !important;">${formatCurrency(payment.amount)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        ` : ''}
        
        <div style="margin-top: 40px; border-top: 1px solid #ccc; padding-top: 20px; text-align: center;">
          <p style="font-family: Assistant, Arial, sans-serif !important; direction: rtl;">מסמך זה מהווה אישור רשמי על רישום ותשלום.</p>
        </div>
      `;
      
      // Append to the document body
      document.body.appendChild(virtualRegistration);
      
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
      let dataUrl;
      try {
        console.log("Starting HTML to image conversion...");
        dataUrl = await toPng(virtualRegistration, { 
          quality: 0.95,
          width: 800,
          height: 1100,
          backgroundColor: 'white',
          skipAutoScale: true,
          pixelRatio: 5, // Higher resolution
          cacheBust: true, // Avoid caching issues
          canvasWidth: 4000, // 5x the width for higher resolution
          canvasHeight: 5500, // 5x the height for higher resolution
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
          debugLink.download = `debug_registration_${registrationId.substring(0, 8)}.png`;
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
        document.body.removeChild(virtualRegistration);
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
      const imgHeight = (1100 * imgWidth) / 800; // Maintain aspect ratio
      
      console.log("Adding image to PDF with dimensions:", { imgWidth, imgHeight });
      pdf.addImage(dataUrl, 'PNG', 0, 0, imgWidth, imgHeight);
      
      // Generate filename
      const fileName = `registration_${participantData.firstName}_${participantData.lastName}_${registrationData.id.substring(0, 8)}.pdf`;
      
      // Save the PDF
      pdf.save(fileName);
      console.log("PDF saved successfully");
      
      toast({
        title: "PDF נוצר בהצלחה",
        description: "אישור הרישום נשמר במכשיר שלך",
      });
      
      return fileName;
    } catch (error) {
      console.error('Error building registration PDF:', error);
      toast({
        variant: "destructive",
        title: "שגיאה ביצירת PDF",
        description: "נא לנסות שוב מאוחר יותר",
      });
      throw new Error('אירעה שגיאה ביצירת מסמך ה-PDF');
    }
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
