
import { Payment, Registration, PaymentStatus } from '@/types';

export const calculatePaymentStatus = (
  registration: Registration,
  payments: Payment[] = []
): { 
  paid: number;
  expected: number;
  status: PaymentStatus;
} => {
  // Calculate total paid amount from all payments
  const paid = payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
  
  // Get the required amount from registration
  const expected = registration.requiredAmount;
  
  // The discountAmount is the amount of discount applied to this registration
  const discountAmount = registration.discountAmount || 0;
  
  // Calculate the effective amount that needs to be paid after discount
  const effectiveRequiredAmount = Math.max(0, registration.requiredAmount - (registration.discountApproved ? discountAmount : 0));
  
  // Determine payment status based on paid amount and effective required amount
  let status: PaymentStatus;
  
  if (registration.discountApproved) {
    if (paid >= effectiveRequiredAmount) {
      status = 'מלא / הנחה';
    } else {
      status = 'חלקי / הנחה';
    }
  } else if (paid >= expected) {
    if (paid > expected) {
      status = 'יתר';
    } else {
      status = 'מלא';
    }
  } else {
    status = 'חלקי';
  }
  
  return { paid, expected, status };
};
