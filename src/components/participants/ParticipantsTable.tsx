
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Participant, PaymentStatus, Registration, Payment } from '@/types';

interface ParticipantsTableProps {
  registrations: Registration[];
  getParticipantForRegistration: (registration: Registration) => Participant | undefined;
  getPaymentsForRegistration: (registration: Registration) => Payment[];
  calculatePaymentStatus: (registration: Registration) => PaymentStatus;
  getStatusClassName: (status: PaymentStatus) => string;
  onAddPayment: (registration: Registration) => void;
  onDeleteRegistration: (registrationId: string) => void;
}

const ParticipantsTable: React.FC<ParticipantsTableProps> = ({
  registrations,
  getParticipantForRegistration,
  getPaymentsForRegistration,
  calculatePaymentStatus,
  getStatusClassName,
  onAddPayment,
  onDeleteRegistration,
}) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>שם מלא</TableHead>
            <TableHead>ת.ז</TableHead>
            <TableHead>טלפון</TableHead>
            <TableHead>סכום לתשלום</TableHead>
            <TableHead>תשלומים</TableHead>
            <TableHead>הנחה</TableHead>
            <TableHead>סטטוס</TableHead>
            <TableHead>פעולות</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {registrations.map((registration) => {
            const participant = getParticipantForRegistration(registration);
            const registrationPayments = getPaymentsForRegistration(registration);
            const status = calculatePaymentStatus(registration);
            
            if (!participant) return null;
            
            return (
              <TableRow key={registration.id}>
                <TableCell>{`${participant.firstName} ${participant.lastName}`}</TableCell>
                <TableCell>{participant.idNumber}</TableCell>
                <TableCell>{participant.phone}</TableCell>
                <TableCell>{Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(registration.requiredAmount)}</TableCell>
                <TableCell>
                  {registrationPayments.length > 0 ? (
                    <div className="space-y-1">
                      {registrationPayments.map((payment, idx) => (
                        <div key={idx} className="text-sm">
                          <div>{Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(payment.amount)}</div>
                          <div className="text-gray-500 text-xs">{payment.receiptNumber}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-500">-</span>
                  )}
                </TableCell>
                <TableCell>{registration.discountApproved ? 'כן' : 'לא'}</TableCell>
                <TableCell className={`font-semibold ${getStatusClassName(status)}`}>
                  {status}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onAddPayment(registration)}
                      className="ml-2"
                    >
                      הוסף תשלום
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onDeleteRegistration(registration.id)}
                    >
                      הסר
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default ParticipantsTable;
