
import React from 'react';
import { Payment } from '@/types';

interface TableReceiptNumbersProps {
  payments: Payment[];
}

const TableReceiptNumbers: React.FC<TableReceiptNumbersProps> = ({ payments }) => {
  if (payments.length === 0) {
    return <span className="text-gray-500">-</span>;
  }
  
  return (
    <div className="space-y-1">
      {payments.map((payment, idx) => (
        <div key={idx} className="text-xs text-gray-500">
          {payment.receiptNumber ? payment.receiptNumber : '--'}
        </div>
      ))}
    </div>
  );
};

export default TableReceiptNumbers;
