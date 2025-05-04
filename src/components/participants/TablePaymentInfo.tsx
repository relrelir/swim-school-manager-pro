
import React from 'react';
import { Payment } from '@/types';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';

interface TablePaymentInfoProps {
  payments: Payment[];
  discountAmount: number;
  discountApproved: boolean;
  onPrintReceipt?: (paymentId: string) => void;
}

const TablePaymentInfo: React.FC<TablePaymentInfoProps> = ({
  payments,
  discountAmount,
  discountApproved,
  onPrintReceipt
}) => {
  // Helper to identify actual payments (ones that have receipt numbers)
  const actualPayments = payments.filter(p => p.receiptNumber !== '');
  
  if (actualPayments.length === 0) {
    return <span className="text-gray-500">-</span>;
  }
  
  return (
    <div className="space-y-1">
      {actualPayments.map((payment, idx) => (
        <div key={idx} className="text-sm flex items-center justify-between">
          <span>
            {Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(payment.amount)}
          </span>
          {onPrintReceipt && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6" 
              onClick={(e) => {
                e.stopPropagation();
                onPrintReceipt(payment.id);
              }}
            >
              <Printer className="h-3 w-3" />
            </Button>
          )}
        </div>
      ))}
    </div>
  );
};

export default TablePaymentInfo;
