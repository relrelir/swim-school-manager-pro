
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PaymentStatus, RegistrationWithDetails } from '@/types';
import { useData } from '@/context/DataContext';

interface RegistrationsTableProps {
  registrations: RegistrationWithDetails[];
}

const RegistrationsTable: React.FC<RegistrationsTableProps> = ({ registrations }) => {
  const { calculateMeetingProgress } = useData();
  
  // Calculate payment status class
  const getStatusClassName = (status: PaymentStatus): string => {
    switch (status) {
      case 'מלא':
        return 'bg-status-paid bg-opacity-20 text-green-800';
      case 'חלקי':
        return 'bg-status-partial bg-opacity-20 text-yellow-800';
      case 'יתר':
        return 'bg-status-overdue bg-opacity-20 text-red-800';
      default:
        return '';
    }
  };

  return (
    <>
      {registrations.length === 0 ? (
        <div className="text-center p-10 bg-gray-50 rounded-lg">
          <p className="text-lg text-gray-500">לא נמצאו רישומים מתאימים לסינון שנבחר.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>שם מלא</TableHead>
                <TableHead>ת.ז</TableHead>
                <TableHead>טלפון</TableHead>
                <TableHead>עונה</TableHead>
                <TableHead>מוצר</TableHead>
                <TableHead>סוג מוצר</TableHead>
                <TableHead>סכום לתשלום</TableHead>
                <TableHead>סכום ששולם</TableHead>
                <TableHead>מספרי קבלות</TableHead>
                <TableHead>מפגש נוכחי</TableHead>
                <TableHead>סטטוס תשלום</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {registrations.map((registration) => {
                // Get receipt numbers from payments
                const receiptNumbers = registration.payments 
                  ? registration.payments.map(p => p.receiptNumber).join(', ')
                  : registration.receiptNumber;
                
                // Calculate meeting progress
                const meetingProgress = calculateMeetingProgress(registration.product);
                
                return (
                  <TableRow key={registration.id}>
                    <TableCell>{`${registration.participant.firstName} ${registration.participant.lastName}`}</TableCell>
                    <TableCell>{registration.participant.idNumber}</TableCell>
                    <TableCell>{registration.participant.phone}</TableCell>
                    <TableCell>{registration.season.name}</TableCell>
                    <TableCell>{registration.product.name}</TableCell>
                    <TableCell>{registration.product.type}</TableCell>
                    <TableCell>{Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(registration.requiredAmount)}</TableCell>
                    <TableCell>{Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(registration.paidAmount)}</TableCell>
                    <TableCell>{receiptNumbers}</TableCell>
                    <TableCell>
                      {meetingProgress.current}/{meetingProgress.total}
                    </TableCell>
                    <TableCell className={`font-semibold ${getStatusClassName(registration.paymentStatus)}`}>
                      {registration.paymentStatus}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
};

export default RegistrationsTable;
