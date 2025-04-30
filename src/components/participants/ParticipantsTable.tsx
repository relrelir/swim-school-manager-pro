
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Participant, PaymentStatus, Registration, Payment, HealthDeclaration } from '@/types';
import TableHealthStatus from './TableHealthStatus';
import TablePaymentInfo from './TablePaymentInfo';
import TableReceiptNumbers from './TableReceiptNumbers';
import TableRowActions from './TableRowActions';
import ParticipantsTableHeader from './ParticipantsTableHeader';

interface ParticipantsTableProps {
  registrations: Registration[];
  getParticipantForRegistration: (registration: Registration) => Participant | undefined;
  getPaymentsForRegistration: (registration: Registration) => Payment[];
  getHealthDeclarationForRegistration?: (registrationId: string) => HealthDeclaration | undefined;
  calculatePaymentStatus: (registration: Registration) => PaymentStatus;
  getStatusClassName: (status: PaymentStatus) => string;
  onAddPayment: (registration: Registration) => void;
  onDeleteRegistration: (registrationId: string) => void;
  onUpdateHealthApproval: (participant: Participant, isApproved: boolean) => void;
  onOpenHealthForm?: (registrationId: string) => void;
  onExport?: () => void;
}

const ParticipantsTable: React.FC<ParticipantsTableProps> = ({
  registrations,
  getParticipantForRegistration,
  getPaymentsForRegistration,
  getHealthDeclarationForRegistration,
  calculatePaymentStatus,
  getStatusClassName,
  onAddPayment,
  onDeleteRegistration,
  onUpdateHealthApproval,
  onOpenHealthForm,
  onExport,
}) => {
  // Helper to calculate discount amount
  const calculateDiscountAmount = (registration: Registration) => {
    return registration.discountAmount || 0;
  };

  return (
    <div className="overflow-x-auto">
      <ParticipantsTableHeader onExport={onExport} />
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>שם מלא</TableHead>
            <TableHead>ת.ז</TableHead>
            <TableHead>טלפון</TableHead>
            <TableHead>סכום לתשלום</TableHead>
            <TableHead>תשלומים</TableHead>
            <TableHead>מספרי קבלות</TableHead>
            <TableHead>הנחה</TableHead>
            <TableHead>הצהרת בריאות</TableHead>
            <TableHead>סטטוס</TableHead>
            <TableHead>פעולות</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {registrations.map((registration) => {
            const participant = getParticipantForRegistration(registration);
            const registrationPayments = getPaymentsForRegistration(registration);
            const discountAmount = calculateDiscountAmount(registration);
            const status = calculatePaymentStatus(registration);
            const hasPayments = registrationPayments.length > 0;
            const healthDeclaration = getHealthDeclarationForRegistration && 
              getHealthDeclarationForRegistration(registration.id);
            
            if (!participant) return null;
            
            return (
              <TableRow key={registration.id}>
                <TableCell>{`${participant.firstName} ${participant.lastName}`}</TableCell>
                <TableCell>{participant.idNumber}</TableCell>
                <TableCell>{participant.phone}</TableCell>
                <TableCell>
                  {Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(registration.requiredAmount)}
                </TableCell>
                <TableCell>
                  <TablePaymentInfo 
                    payments={registrationPayments} 
                    discountAmount={discountAmount}
                    discountApproved={registration.discountApproved}
                  />
                </TableCell>
                <TableCell>
                  <TableReceiptNumbers payments={registrationPayments} />
                </TableCell>
                <TableCell>{registration.discountApproved ? 'כן' : 'לא'}</TableCell>
                <TableCell>
                  <TableHealthStatus 
                    registration={registration}
                    participant={participant}
                    healthDeclaration={healthDeclaration}
                    onUpdateHealthApproval={onUpdateHealthApproval}
                    onOpenHealthForm={onOpenHealthForm}
                  />
                </TableCell>
                <TableCell className={`font-semibold ${getStatusClassName(status)}`}>
                  {status}
                </TableCell>
                <TableCell>
                  <TableRowActions 
                    registration={registration}
                    hasPayments={hasPayments}
                    onAddPayment={onAddPayment}
                    onDeleteRegistration={onDeleteRegistration}
                  />
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
