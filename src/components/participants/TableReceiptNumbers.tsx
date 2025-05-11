
import React from 'react';
import { Payment, Registration } from '@/types';

interface TableReceiptNumbersProps {
  payments: Payment[];
  registration?: Registration; // Added registration prop as fallback data source
}

const TableReceiptNumbers: React.FC<TableReceiptNumbersProps> = ({ payments, registration }) => {
  // If we have payments, use them
  if (payments.length > 0) {
    return (
      <div className="space-y-1">
        {payments.map((payment, idx) => (
          <div key={idx} className="text-xs text-gray-500">
            {payment.receiptNumber ? payment.receiptNumber : '--'}
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
