
import React, { useEffect } from 'react';
import { Payment, Registration } from '@/types';
import { formatCurrencyForTableUI } from '@/utils/formatters';

interface TablePaymentInfoProps {
  payments: Payment[];
  discountAmount: number;
  discountApproved: boolean;
  registration?: Registration; // Added registration prop as fallback data source
}

const TablePaymentInfo: React.FC<TablePaymentInfoProps> = ({
  payments,
  discountAmount,
  discountApproved,
  registration
}) => {
  // Debug info
  useEffect(() => {
    console.log("TablePaymentInfo rendering with payments:", payments);
    if (registration) {
      console.log("TablePaymentInfo has registration data:", registration);
    }
  }, [payments, registration]);
  
  // Filter to only show payments that have receipt numbers (actual payments)
  const actualPayments = payments.filter(p => p.receiptNumber !== undefined && p.receiptNumber !== '');
  
  // If we have a registration with paid amount but no payment records, 
  // create a synthetic payment entry from registration data
  let displayPayments = actualPayments;
  
  // Only add the synthetic payment if there are no actual payments and the registration has a paid amount
  if (actualPayments.length === 0 && registration && registration.paidAmount > 0) {
    displayPayments = [{
      id: 'initial-payment', // Use a placeholder ID
      registrationId: registration.id,
      amount: registration.paidAmount,
      receiptNumber: registration.receiptNumber || 'Initial Payment',
      paymentDate: registration.registrationDate
    } as Payment];
  }
  
  if (displayPayments.length === 0) {
    return <span className="text-gray-500">-</span>;
  }
  
  return (
    <div className="space-y-1">
      {displayPayments.map((payment, idx) => (
        <div key={payment.id || idx} className="text-sm">
          {formatCurrencyForTableUI(payment.amount)}
        </div>
      ))}
      
      {discountApproved && discountAmount > 0 && (
        <div className="text-sm text-green-600">
          {`הנחה: ${formatCurrencyForTableUI(discountAmount)}`}
        </div>
      )}
    </div>
  );
};

export default TablePaymentInfo;
