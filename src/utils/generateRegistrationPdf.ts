
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/use-toast";
import { Registration, Participant, Payment } from '@/types';
import { formatCurrency } from '@/utils/formatters';
import { format } from 'date-fns';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { configureHebrewFont, ensureAssistantFontLoaded } from './pdf/hebrewPdfConfig';

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
      // Ensure Assistant font is loaded
      await document.fonts.ready;
      await ensureAssistantFontLoaded();
      
      console.log("Available fonts:", Array.from(document.fonts).map(f => f.family));
      
      // Create a virtual registration certificate in the DOM
      const virtualRegistration = document.createElement('div');
      virtualRegistration.style.width = '800px';
      virtualRegistration.style.height = '1100px';
      virtualRegistration.style.padding = '40px';
      virtualRegistration.style.fontFamily = 'Assistant, Arial, sans-serif';
      virtualRegistration.style.direction = 'rtl';
      virtualRegistration.style.backgroundColor = 'white';
      virtualRegistration.style.position = 'absolute';
      virtualRegistration.style.top = '0';
      virtualRegistration.style.left = '-2000px'; // Off-screen but not too far
      virtualRegistration.style.zIndex = '-1000';
      virtualRegistration.style.overflow = 'visible';
      
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
        table, th, td {
          font-family: 'Assistant', Arial, sans-serif !important;
        }
      `;
      virtualRegistration.appendChild(style);
      
      // Calculate effective required amount (after discount)
      const discountAmount = registrationData.discountAmount || 0;
      const effectiveRequiredAmount = Math.max(0, registrationData.requiredAmount - (registrationData.discountApproved ? discountAmount : 0));
      
      // Format current date for display
      const currentDate = format(new Date(), 'dd/MM/yyyy');
      
      // Build registration certificate HTML
      virtualRegistration.innerHTML += `
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="font-size: 28px; margin-bottom: 10px; font-family: Assistant, Arial, sans-serif;">אישור רישום למוצר</h1>
          <p style="font-size: 14px; color: #666;">${currentDate}</p>
        </div>
        
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="font-size: 22px; font-family: Assistant, Arial, sans-serif;">מוצר: ${product.name}</h2>
        </div>
        
        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 18px; margin-bottom: 15px; font-family: Assistant, Arial, sans-serif;">פרטי משתתף:</h3>
          <div style="border: 1px solid #eee; padding: 15px; border-radius: 5px;">
            <p><span style="font-weight: bold;">שם מלא:</span> ${participantData.firstName} ${participantData.lastName}</p>
            <p><span style="font-weight: bold;">תעודת זהות:</span> ${participantData.idNumber || ''}</p>
            <p><span style="font-weight: bold;">טלפון:</span> ${participantData.phone || ''}</p>
          </div>
        </div>
        
        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 18px; margin-bottom: 15px; font-family: Assistant, Arial, sans-serif;">פרטי רישום:</h3>
          <div style="border: 1px solid #eee; padding: 15px; border-radius: 5px;">
            <p><span style="font-weight: bold;">תאריך רישום:</span> ${format(new Date(registrationData.registrationDate), 'dd/MM/yyyy')}</p>
            <p><span style="font-weight: bold;">סכום מקורי:</span> ${formatCurrency(registrationData.requiredAmount)}</p>
            <p><span style="font-weight: bold;">הנחה:</span> ${registrationData.discountApproved ? formatCurrency(discountAmount) : 'לא'}</p>
            <p><span style="font-weight: bold;">סכום לתשלום:</span> ${formatCurrency(effectiveRequiredAmount)}</p>
            <p><span style="font-weight: bold;">סכום ששולם:</span> ${formatCurrency(registrationData.paidAmount)}</p>
          </div>
        </div>
        
        ${paymentsData.length > 0 ? `
          <div style="margin-bottom: 30px;">
            <h3 style="font-size: 18px; margin-bottom: 15px; font-family: Assistant, Arial, sans-serif;">פרטי תשלומים:</h3>
            <div style="border: 1px solid #eee; padding: 15px; border-radius: 5px;">
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="background-color: #f5f5f5;">
                    <th style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd;">תאריך תשלום</th>
                    <th style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd;">מספר קבלה</th>
                    <th style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd;">סכום</th>
                  </tr>
                </thead>
                <tbody>
                  ${paymentsData.map(payment => `
                    <tr>
                      <td style="padding: 8px; text-align: right; border-bottom: 1px solid #eee;">${format(new Date(payment.paymentDate), 'dd/MM/yyyy')}</td>
                      <td style="padding: 8px; text-align: right; border-bottom: 1px solid #eee;">${payment.receiptNumber}</td>
                      <td style="padding: 8px; text-align: right; border-bottom: 1px solid #eee;">${formatCurrency(payment.amount)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        ` : ''}
        
        <div style="margin-top: 40px; border-top: 1px solid #ccc; padding-top: 20px; text-align: center;">
          <p>מסמך זה מהווה אישור רשמי על רישום ותשלום.</p>
        </div>
      `;
      
      // Append to the document body to render properly
      document.body.appendChild(virtualRegistration);
      
      // Wait longer for the fonts to load properly before generating image
      console.log("HTML element created and appended, waiting for fonts to load...");
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log("Font loading wait complete, proceeding to image conversion");
      
      // Convert the HTML to an image with better error handling
      let dataUrl;
      try {
        console.log("Starting HTML to image conversion...");
        dataUrl = await toPng(virtualRegistration, { 
          quality: 0.95,
          width: 800,
          height: 1100,
          backgroundColor: 'white',
          skipAutoScale: true,
          pixelRatio: 3, // Higher resolution
          cacheBust: true, // Avoid caching issues
          canvasWidth: 2400, // 3x the width for higher resolution
          canvasHeight: 3300, // 3x the height for higher resolution
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
      document.body.removeChild(virtualRegistration);
      
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
