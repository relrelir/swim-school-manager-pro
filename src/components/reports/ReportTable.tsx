
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RegistrationWithDetails, PaymentStatus } from '@/types';

interface ReportTableProps {
  registrations: RegistrationWithDetails[];
}

export const ReportTable: React.FC<ReportTableProps> = ({ registrations }) => {
  if (!registrations.length) {
    return <div className="text-center py-6">לא נמצאו רישומים</div>;
  }

  // Function to get payment status style
  const getPaymentStatusStyle = (status: PaymentStatus) => {
    switch (status) {
      case 'paid':
      case 'מלא':
      case 'מלא / הנחה':
        return 'text-green-600';
      case 'partial':
      case 'חלקי':
      case 'חלקי / הנחה':
        return 'text-yellow-600';
      case 'unpaid':
      case 'יתר':
        return 'text-red-600';
      case 'discounted':
      case 'הנחה':
        return 'text-blue-600';
      default:
        return '';
    }
  };

  return (
    <div className="border rounded-lg">
      <Table dir="rtl">
        <TableHeader>
          <TableRow className="bg-gray-100">
            <TableHead className="text-right">שם משתתף</TableHead>
            <TableHead className="text-right">תעודת זהות</TableHead>
            <TableHead className="text-right">מוצר</TableHead>
            <TableHead className="text-right">עונה</TableHead>
            <TableHead className="text-right">תאריך רישום</TableHead>
            <TableHead className="text-right">סכום לתשלום</TableHead>
            <TableHead className="text-right">סכום ששולם</TableHead>
            <TableHead className="text-right">סטטוס</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {registrations.map((registration) => (
            <TableRow key={registration.id}>
              <TableCell>
                {registration.participant.firstName} {registration.participant.lastName}
              </TableCell>
              <TableCell>{registration.participant.idNumber}</TableCell>
              <TableCell>{registration.product.name}</TableCell>
              <TableCell>{registration.season.name}</TableCell>
              <TableCell>
                {new Date(registration.registrationDate).toLocaleDateString('he-IL')}
              </TableCell>
              <TableCell>
                {registration.requiredAmount.toLocaleString('he-IL', { style: 'currency', currency: 'ILS' })}
              </TableCell>
              <TableCell>
                {registration.paidAmount.toLocaleString('he-IL', { style: 'currency', currency: 'ILS' })}
              </TableCell>
              <TableCell>
                <span className={getPaymentStatusStyle(registration.paymentStatus)}>
                  {registration.paymentStatus}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
