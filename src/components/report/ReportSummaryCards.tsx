
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { RegistrationWithDetails } from '@/types';
import { formatPriceForUI } from '@/utils/formatters';

interface ReportSummaryCardsProps {
  registrations: RegistrationWithDetails[];
}

const ReportSummaryCards: React.FC<ReportSummaryCardsProps> = ({ registrations }) => {
  // Calculate totals
  const totalRequiredAmount = registrations.reduce((sum, reg) => sum + reg.requiredAmount, 0);
  const totalDiscountAmount = registrations.reduce((sum, reg) => 
    sum + (reg.discountApproved ? (reg.discountAmount || 0) : 0), 0);
  const totalEffectiveAmount = registrations.reduce((sum, reg) => 
    sum + Math.max(0, reg.requiredAmount - (reg.discountApproved ? (reg.discountAmount || 0) : 0)), 0);
  const totalPaidAmount = registrations.reduce((sum, reg) => {
    if (!reg.payments) return sum + reg.paidAmount;
    return sum + reg.payments.reduce((pSum, payment) => pSum + payment.amount, 0);
  }, 0);
  const totalRegistrations = registrations.length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4 flex flex-col items-center">
          <div className="text-2xl font-bold">{totalRegistrations}</div>
          <div className="text-sm text-gray-500">סה"כ רישומים</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 flex flex-col items-center">
          <div className="text-2xl font-bold">
            {formatPriceForUI(totalRequiredAmount)}
          </div>
          <div className="text-sm text-gray-500">סכום מקורי</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 flex flex-col items-center">
          <div className="text-2xl font-bold">
            {formatPriceForUI(totalEffectiveAmount)}
          </div>
          <div className="text-sm text-gray-500">סה"כ לתשלום</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 flex flex-col items-center">
          <div className="text-2xl font-bold">
            {formatPriceForUI(totalPaidAmount)}
          </div>
          <div className="text-sm text-gray-500">סה"כ שולם</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportSummaryCards;
