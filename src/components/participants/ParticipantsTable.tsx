
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Participant, PaymentStatus, Registration, Payment, HealthDeclaration } from '@/types';
import TableHealthStatus from './TableHealthStatus';
import TablePaymentInfo from './TablePaymentInfo';
import TableReceiptNumbers from './TableReceiptNumbers';
import TableRowActions from './TableRowActions';
import ParticipantsTableHeader from './ParticipantsTableHeader';
import { formatCurrencyForTableUI } from '@/utils/formatters';

interface ParticipantsTableProps {
  registrations: Registration[];
  getParticipantForRegistration: (registration: Registration) => Participant | undefined;
  getPaymentsForRegistration: (registration: Registration | string) => Payment[];
  getHealthDeclarationForRegistration: (registrationId: string) => Promise<HealthDeclaration | undefined>;
  calculatePaymentStatus: (registration: Registration) => PaymentStatus;
  getStatusClassName: (status: string) => string;
  onAddPayment: (registration: Registration) => void;
  onDeleteRegistration: (id: string) => void;
  onUpdateHealthApproval: (registrationId: string, isApproved: boolean) => void;
  onOpenHealthForm: (registrationId: string) => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
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
  searchQuery,
  setSearchQuery
}) => {
  // Helper to calculate discount amount
  const calculateDiscountAmount = (registration: Registration) => {
    return registration.discountAmount || 0;
  };

  // Helper to calculate effective amount required after discount
  const calculateEffectiveRequiredAmount = (registration: Registration) => {
    const discountAmount = registration.discountAmount || 0;
    return Math.max(0, registration.requiredAmount - (registration.discountApproved ? discountAmount : 0));
  };

  return (
    <div className="space-y-4">
      <ParticipantsTableHeader 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>שם מלא</TableHead>
            <TableHead>ת.ז</TableHead>
            <TableHead>טלפון</TableHead>
            <TableHead>סכום מקורי</TableHead>
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
            const effectiveRequiredAmount = calculateEffectiveRequiredAmount(registration);
            const status = calculatePaymentStatus(registration);
            const hasPayments = registrationPayments.length > 0;
            
            if (!participant) return null;
            
            return (
              <TableRow key={registration.id}>
                <TableCell>{`${participant.firstName} ${participant.lastName}`}</TableCell>
                <TableCell>{participant.idNumber}</TableCell>
                <TableCell>{participant.phone}</TableCell>
                <TableCell>
                  {formatCurrencyForTableUI(registration.requiredAmount)}
                </TableCell>
                <TableCell>
                  {formatCurrencyForTableUI(effectiveRequiredAmount)}
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
                <TableCell>
                  {registration.discountApproved && discountAmount > 0 ? 
                    formatCurrencyForTableUI(discountAmount) : 
                    'לא'}
                </TableCell>
                <TableCell>
                  <TableHealthStatus 
                    registration={registration}
                    participant={participant}
                    onUpdateHealthApproval={(isApproved) => onUpdateHealthApproval(registration.id, isApproved)}
                    onOpenHealthForm={() => onOpenHealthForm(registration.id)}
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
