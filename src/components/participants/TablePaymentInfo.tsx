
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
  // Only show payments that have receipt numbers (actual payments)
  const actualPayments = payments.filter(p => p.receiptNumber !== undefined && p.receiptNumber !== '');
  
  if (actualPayments.length === 0) {
    return <span className="text-gray-500">-</span>;
  }
  
  return (
    <div className="space-y-1">
      {actualPayments.map((payment, idx) => (
        <div key={idx} className="text-sm">
          {formatCurrencyForTableUI(payment.amount)}
          {idx === 0 && (
            <span className="text-xs text-muted-foreground ml-1">(ראשוני)</span>
          )}
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
