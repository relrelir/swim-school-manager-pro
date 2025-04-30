
import React from 'react';
import { Registration } from '@/types';
import ParticipantsSummaryCards from '@/components/participants/ParticipantsSummaryCards';
import ParticipantsTable from '@/components/participants/ParticipantsTable';
import EmptyParticipantsState from '@/components/participants/EmptyParticipantsState';

interface ParticipantsContentProps {
  registrations: Registration[];
  totalParticipants: number;
  product: any;
  totalExpected: number;
  totalPaid: number;
  registrationsFilled: number;
  getParticipantForRegistration: (registration: Registration) => any;
  getPaymentsForRegistration: (registrationId: string) => any[];
  getHealthDeclarationForRegistration: (registrationId: string) => any;
  calculatePaymentStatus: (registration: Registration) => any;
  getStatusClassName: (status: string) => string;
  onAddPayment: (registration: Registration) => void;
  onDeleteRegistration: (id: string) => void;
  onUpdateHealthApproval: (registrationId: string, isApproved: boolean) => void;
  onOpenHealthForm: (registrationId: string) => void;
  onExport: () => void;
}

const ParticipantsContent: React.FC<ParticipantsContentProps> = ({
  registrations,
  totalParticipants,
  product,
  totalExpected,
  totalPaid,
  registrationsFilled,
  getParticipantForRegistration,
  getPaymentsForRegistration,
  getHealthDeclarationForRegistration,
  calculatePaymentStatus,
  getStatusClassName,
  onAddPayment,
  onDeleteRegistration,
  onUpdateHealthApproval,
  onOpenHealthForm,
  onExport
}) => {
  return (
    <>
      <ParticipantsSummaryCards 
        totalParticipants={totalParticipants}
        product={product}
        totalExpected={totalExpected}
        totalPaid={totalPaid}
        registrationsFilled={registrationsFilled}
      />

      {registrations.length === 0 ? (
        <EmptyParticipantsState />
      ) : (
        <ParticipantsTable
          registrations={registrations}
          getParticipantForRegistration={getParticipantForRegistration}
          getPaymentsForRegistration={getPaymentsForRegistration}
          getHealthDeclarationForRegistration={getHealthDeclarationForRegistration}
          calculatePaymentStatus={calculatePaymentStatus}
          getStatusClassName={getStatusClassName}
          onAddPayment={onAddPayment}
          onDeleteRegistration={onDeleteRegistration}
          onUpdateHealthApproval={onUpdateHealthApproval}
          onOpenHealthForm={onOpenHealthForm}
          onExport={onExport}
        />
      )}
    </>
  );
};

export default ParticipantsContent;
