
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/use-toast";
import { makePdf, createTableData } from '@/pdf/pdfService';
import { format } from 'date-fns';
import { formatCurrency } from '@/utils/formatters';

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
    
    // Format data for PDF
    const currentDate = format(new Date(), 'dd/MM/yyyy');
    const registrationDate = format(new Date(registration.registrationdate), 'dd/MM/yyyy');
    const effectiveRequiredAmount = Math.max(0, registration.requiredamount - (registration.discountapproved ? registration.discountamount || 0 : 0));
    
    // Format payment data for table
    const paymentRows = payments ? payments.map(payment => [
      format(new Date(payment.paymentdate), 'dd/MM/yyyy'),
      payment.receiptnumber || '-',
      formatCurrency(payment.amount)
    ]) : [];
    
    // Generate filename
    const fileName = `registration_${participant.firstname}_${participant.lastname}_${registration.id.substring(0, 8)}.pdf`;
    
    // Create PDF document definition with proper content structure
    const docDefinition = {
      content: [
        // Title with product name
        { text: 'אישור רישום למוצר', style: 'header', alignment: 'center' },
        { text: `מוצר: ${product.name}`, style: 'productName', alignment: 'center', margin: [0, 0, 0, 20] },
        { text: `תאריך: ${currentDate}`, alignment: 'left', margin: [0, 0, 0, 20] },
        
        // Participant information
        { text: 'פרטי משתתף:', style: 'subheader' },
        createTableData(
          ['שם מלא:', 'תעודת זהות:', 'טלפון:'],
          [[`${participant.firstname} ${participant.lastname}`, participant.idnumber, participant.phone]]
        ),
        
        // Registration information
        { text: 'פרטי רישום:', style: 'subheader', margin: [0, 20, 0, 10] },
        createTableData(
          ['תאריך רישום:', 'סכום מקורי:', 'הנחה:', 'סכום לתשלום:', 'סכום ששולם:'],
          [[
            registrationDate,
            formatCurrency(registration.requiredamount),
            registration.discountapproved ? formatCurrency(registration.discountamount || 0) : 'לא',
            formatCurrency(effectiveRequiredAmount),
            formatCurrency(registration.paidamount)
          ]]
        ),
        
        // Payment details if any exist
        payments && payments.length > 0 ? 
          { text: 'פרטי תשלומים:', style: 'subheader', margin: [0, 20, 0, 10] } : null,
          
        payments && payments.length > 0 ? 
          createTableData(
            ['תאריך תשלום', 'מספר קבלה', 'סכום'],
            paymentRows
          ) : null,
        
        // Footer
        { text: 'מסמך זה מהווה אישור רשמי על רישום ותשלום.', style: 'footer', alignment: 'center', margin: [0, 30, 0, 0] }
      ].filter(Boolean), // Filter out null items
      styles: {
        header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] },
        productName: { fontSize: 16, bold: true },
        subheader: { fontSize: 14, bold: true, margin: [0, 10, 0, 10] },
        tableHeader: { bold: true, fillColor: '#f5f5f5' },
        footer: { fontSize: 10, italics: true }
      }
    };
    
    // Generate and download the PDF
    console.log("Generating registration PDF");
    await makePdf(docDefinition, fileName);
    
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
