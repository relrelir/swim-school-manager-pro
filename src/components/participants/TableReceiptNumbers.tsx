
import React from 'react';
import { Payment, Registration } from '@/types';

interface TableReceiptNumbersProps {
  payments: Payment[];
  registration?: Registration; // Added registration prop as fallback data source
}

const TableReceiptNumbers: React.FC<TableReceiptNumbersProps> = ({ payments, registration }) => {
  // Filter to only show payments that have receipt numbers (actual payments)
  const actualPayments = payments.filter(p => p.receiptNumber !== undefined && p.receiptNumber !== '');
  
  // If we have a registration with paid amount but no payment records, 
  // create a synthetic payment entry from registration data
  let displayPayments = actualPayments;
  
  // Only add the synthetic payment if there are no actual payments and the registration has a paid amount
  if (actualPayments.length === 0 && registration?.receiptNumber && registration.paidAmount > 0) {
    displayPayments = [{
      id: 'initial-payment',
      registrationId: registration.id,
      amount: registration.paidAmount,
      receiptNumber: registration.receiptNumber,
      paymentDate: registration.registrationDate
    } as Payment];
  }
  
  if (displayPayments.length === 0) {
    return <span className="text-gray-500">-</span>;
  }
  
  return (
    <div className="space-y-1">
      {displayPayments.map((payment, idx) => (
        <div key={idx} className="text-xs text-gray-500">
          {payment.receiptNumber ? payment.receiptNumber : '--'}
        </div>
      ))}
    </div>
  );
};

export default TableReceiptNumbers;
