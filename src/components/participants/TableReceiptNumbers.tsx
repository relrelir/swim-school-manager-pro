
import React from 'react';
import { Payment, Registration } from '@/types';

interface TableReceiptNumbersProps {
  payments: Payment[];
  registration?: Registration; // Added registration prop as fallback data source
}

const TableReceiptNumbers: React.FC<TableReceiptNumbersProps> = ({ payments, registration }) => {
  // Filter to only show payments that have receipt numbers
  const actualPayments = payments.filter(p => p.receiptNumber !== undefined && p.receiptNumber !== '');
  
  // If we have payments, use them
  if (actualPayments.length > 0) {
    return (
      <div className="space-y-1">
        {actualPayments.map((payment, idx) => (
          <div key={idx} className="text-xs text-gray-500">
            {payment.receiptNumber}
          </div>
        ))}
      </div>
    );
  }
  
  // If no payments but registration has a receipt number and paid amount > 0, show that
  if (registration?.receiptNumber && registration.paidAmount > 0) {
    return (
      <div className="space-y-1">
        <div className="text-xs text-gray-500">
          {registration.receiptNumber}
        </div>
      </div>
    );
  }
  
  return <span className="text-gray-500">-</span>;
};

export default TableReceiptNumbers;
