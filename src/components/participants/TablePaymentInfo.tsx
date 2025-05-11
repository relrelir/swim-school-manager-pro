
import React, { useMemo } from 'react';
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
  // Filter to only show payments that have receipt numbers (actual payments)
  // Using useMemo to prevent unnecessary re-calculations
  const displayPayments = useMemo(() => {
    // Start with actual payments that have receipt numbers
    const actualPayments = payments.filter(p => p.receiptNumber !== undefined && p.receiptNumber !== '');
    
    // If we have actual payments, just use those
    if (actualPayments.length > 0) {
      return actualPayments;
    }
    
    // If no actual payments but we have registration with paid amount, create synthetic payment
    if (registration && registration.paidAmount > 0) {
      return [{
        id: 'initial-payment', // Use a placeholder ID
        registrationId: registration.id,
        amount: registration.paidAmount,
        receiptNumber: registration.receiptNumber || 'Initial Payment',
        paymentDate: registration.registrationDate
      } as Payment];
    }
    
    // No payments at all
    return [];
  }, [payments, registration]);
  
  // Calculate total payments for easier debugging
  const totalPaymentAmount = useMemo(() => {
    return displayPayments.reduce((sum, payment) => sum + Number(payment.amount), 0);
  }, [displayPayments]);
  
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
