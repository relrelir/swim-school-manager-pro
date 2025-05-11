
import React from 'react';
import { Payment } from '@/types';
import { formatCurrencyForTableUI } from '@/utils/formatters';

interface TablePaymentInfoProps {
  payments: Payment[];
  discountAmount: number;
  discountApproved: boolean;
}

const TablePaymentInfo: React.FC<TablePaymentInfoProps> = ({
  payments,
  discountAmount,
  discountApproved
}) => {
  // Helper to identify actual payments (ones that have receipt numbers)
  const actualPayments = payments.filter(p => p.receiptNumber !== '');
  
  if (actualPayments.length === 0 && !discountApproved) {
    return <span className="text-gray-500">-</span>;
  }
  
  return (
    <div className="space-y-1">
      {actualPayments.map((payment, idx) => (
        <div key={idx} className="text-sm">
          {formatCurrencyForTableUI(payment.amount)} - {payment.receiptNumber}
        </div>
      ))}
      {discountApproved && discountAmount > 0 && (
        <div className="text-sm text-green-600">
          הנחה: {formatCurrencyForTableUI(discountAmount)}
        </div>
      )}
    </div>
  );
};

export default TablePaymentInfo;
