
import { Payment, PaymentStatus, PaymentStatusDetails } from '@/types';
import { Registration } from '@/types';

export const calculatePaymentStatus = (
  registration: Registration, 
  registrationPayments: Payment[] = []
): PaymentStatusDetails => {
  // Calculate total paid amount from payments
  const paid = registrationPayments.reduce((sum, payment) => sum + Number(payment.amount), 0);
  const expected = Number(registration.requiredAmount);
  const discountAmount = Number(registration.discountAmount || 0);
  
  // Calculate effective amount that needs to be paid after discount
  const effectiveRequired = registration.discountApproved 
    ? Math.max(0, expected - discountAmount) 
    : expected;

  // Determine payment status
  let status: PaymentStatus = 'מלא';
  
  if (registration.discountApproved) {
    if (paid >= effectiveRequired) {
      status = 'מלא / הנחה';
    } else {
      status = 'חלקי / הנחה';
    }
  } else if (paid === 0) {
    status = 'חלקי';
  } else if (paid < expected) {
    status = 'חלקי';
  } else if (paid > expected) {
    status = 'יתר';
  } else {
    status = 'מלא';
  }
  
  return { paid, expected: effectiveRequired, status };
};
