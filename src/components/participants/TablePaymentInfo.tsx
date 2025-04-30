
import React from 'react';
import { Payment } from '@/types';

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
  // Helper to separate actual payments from discounts
  const actualPayments = payments.filter(p => p.receiptNumber !== '');
  
  if (payments.length === 0) {
    return <span className="text-gray-500">-</span>;
  }
  
  return (
    <div className="space-y-1">
      {payments.map((payment, idx) => (
        <div key={idx} className={`text-sm ${!payment.receiptNumber ? 'text-gray-500 font-medium' : ''}`}>
          {Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(payment.amount)}
        </div>
      ))}
      {discountApproved && discountAmount > 0 && (
        <div className="text-sm text-gray-500 font-medium">
          {Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(discountAmount)} (הנחה)
        </div>
      )}
    </div>
  );
};

export default TablePaymentInfo;
