
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
  
  if (actualPayments.length === 0) {
    return <span className="text-gray-500">-</span>;
  }
  
  return (
    <div className="space-y-1">
      {actualPayments.map((payment, idx) => (
        <div key={idx} className="text-sm">
          {formatCurrencyForTableUI(payment.amount)}
        </div>
      ))}
    </div>
  );
};

export default TablePaymentInfo;
