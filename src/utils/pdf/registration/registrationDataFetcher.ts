
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

/**
 * Fetches all data needed for registration PDF
 */
export const fetchRegistrationData = async (registrationId: string) => {
  console.log("Fetching registration data for ID:", registrationId);

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

  // Format the data for PDF generation
  const registrationData = {
    registrationId: registration.id,
    registrationDate: format(new Date(registration.registrationdate), 'dd/MM/yyyy'),
    requiredAmount: registration.requiredamount,
    discountAmount: registration.discountamount,
    discountApproved: registration.discountapproved,
    paidAmount: registration.paidamount,
    productName: product.name
  };

  const participantData = {
    firstName: participant.firstname,
    lastName: participant.lastname,
    idNumber: participant.idnumber,
    phone: participant.phone
  };

  const formattedPayments = payments ? payments.map(payment => ({
    paymentDate: format(new Date(payment.paymentdate), 'dd/MM/yyyy'),
    receiptNumber: payment.receiptnumber,
    amount: payment.amount
  })) : [];

  return {
    registration: registrationData,
    participant: participantData,
    payments: formattedPayments
  };
};
