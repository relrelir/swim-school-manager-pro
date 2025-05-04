
import { supabase } from '@/integrations/supabase/client';
import { createRtlPdf } from './pdf/pdfConfig';
import { buildRegistrationPDF } from './pdf/registrationPdfContentBuilder';
import { toast } from "@/components/ui/use-toast";
import { Registration, Participant, Payment } from '@/types';

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
      // Create the PDF document with RTL and font support - now async
      console.log("Creating PDF with RTL support");
      const pdf = await createRtlPdf();
      console.log("PDF object created successfully");
      
      // Build the PDF content with the product name
      console.log("Building PDF content with product name:", product.name);
      const fileName = buildRegistrationPDF(pdf, registrationData, participantData, paymentsData, product.name);
      console.log("PDF content built successfully, filename:", fileName);
      
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
