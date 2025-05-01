
import { supabase } from '@/integrations/supabase/client';
import { createPdf } from './pdf/pdfHelpers';
import { buildRegistrationPDF } from './pdf/registrationPdfContentBuilder';
import { toast } from "@/components/ui/use-toast";
import { Registration, Participant, Payment } from '@/types';

export const generateRegistrationPdf = async (registrationId: string) => {
  try {
    // Get the registration details
    const { data: registration, error: registrationError } = await supabase
      .from('registrations')
      .select('*')
      .eq('id', registrationId)
      .single();
    
    if (registrationError || !registration) {
      throw new Error('פרטי הרישום לא נמצאו');
    }
    
    // Get participant details
    const { data: participant, error: participantError } = await supabase
      .from('participants')
      .select('*')
      .eq('id', registration.participantid)
      .single();
    
    if (participantError || !participant) {
      throw new Error('פרטי המשתתף לא נמצאו');
    }
    
    // Get payment details
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('*')
      .eq('registrationid', registrationId)
      .order('paymentdate', { ascending: false });
    
    if (paymentsError) {
      throw new Error('אירעה שגיאה בטעינת פרטי התשלומים');
    }
    
    // Get product name
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('name')
      .eq('id', registration.productid)
      .single();
    
    if (productError || !product) {
      throw new Error('פרטי המוצר לא נמצאו');
    }
    
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
    
    // Create the PDF document
    const pdf = createPdf();
    
    // Build the PDF content
    const fileName = buildRegistrationPDF(pdf, registrationData, participantData, paymentsData, product.name);
    
    // Save the PDF
    pdf.save(fileName);
    
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
