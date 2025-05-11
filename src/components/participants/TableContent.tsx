
import React from 'react';
import { TableBody, TableRow, TableCell } from '@/components/ui/table';
import { Registration, Participant, Payment, PaymentStatusDetails } from '@/types';
import TableHealthStatus from './TableHealthStatus';
import TablePaymentInfo from './TablePaymentInfo';
import TableReceiptNumbers from './TableReceiptNumbers';
import TableRowActions from './table-actions/TableRowActions';
import { formatCurrencyForTableUI } from '@/utils/formatters';

interface TableContentProps {
  registrations: Registration[];
  registrationPayments: Record<string, Payment[]>;
  getParticipantForRegistration: (registration: Registration) => Participant | undefined;
  calculatePaymentStatus: (registration: Registration, payments: Payment[]) => PaymentStatusDetails;
  getStatusClassName: (status: string) => string;
  onAddPayment: (registration: Registration) => void;
  onDeleteRegistration: (id: string) => void;
  onUpdateHealthApproval: (registrationId: string, isApproved: boolean) => void;
  onOpenHealthForm: (registrationId: string) => void;
}

const TableContent: React.FC<TableContentProps> = ({
  registrations,
  registrationPayments,
  getParticipantForRegistration,
  calculatePaymentStatus,
  getStatusClassName,
  onAddPayment,
  onDeleteRegistration,
  onUpdateHealthApproval,
  onOpenHealthForm
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
    <TableBody>
      {registrations.map((registration) => {
        const participant = getParticipantForRegistration(registration);
        const regPayments = registrationPayments[registration.id] || [];
        const discountAmount = calculateDiscountAmount(registration);
        const effectiveRequiredAmount = calculateEffectiveRequiredAmount(registration);
        const paymentDetails = calculatePaymentStatus(registration, regPayments);
        const status = paymentDetails.status;
        const hasPayments = regPayments.length > 0;
        
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
                payments={regPayments} 
                discountAmount={discountAmount}
                discountApproved={registration.discountApproved}
                registration={registration}
              />
            </TableCell>
            <TableCell>
              <TableReceiptNumbers 
                payments={regPayments}
                registration={registration}
              />
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
  );
};

export default TableContent;
