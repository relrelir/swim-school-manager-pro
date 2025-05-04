
import React from 'react';
import { Registration, Participant, Payment, HealthDeclaration, PaymentStatus } from '@/types';
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
  getParticipantForRegistration: (registration: Registration) => Participant | undefined;
  getPaymentsForRegistration: (registrationId: string) => Payment[]; // Changed to accept registrationId
  getHealthDeclarationForRegistration: (registrationId: string) => HealthDeclaration | undefined;
  calculatePaymentStatus: (registration: Registration) => PaymentStatus;
  getStatusClassName: (status: string) => string;
  onAddPayment: (registration: Registration) => void;
  onDeleteRegistration: (id: string) => void;
  onUpdateHealthApproval: (registrationId: string, isApproved: boolean) => void; // Changed to accept registrationId
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
  // Create adapter functions to handle the type conversion
  const getPaymentsAdapter = (registration: Registration) => {
    return getPaymentsForRegistration(registration.id);
  };
  
  const updateHealthApprovalAdapter = (participant: Participant, isApproved: boolean) => {
    // Find the registration for this participant
    const registration = registrations.find(reg => reg.participantId === participant.id);
    if (registration) {
      onUpdateHealthApproval(registration.id, isApproved);
    }
  };

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
          getPaymentsForRegistration={getPaymentsAdapter}
          getHealthDeclarationForRegistration={getHealthDeclarationForRegistration}
          calculatePaymentStatus={calculatePaymentStatus}
          getStatusClassName={getStatusClassName}
          onAddPayment={onAddPayment}
          onDeleteRegistration={onDeleteRegistration}
          onUpdateHealthApproval={updateHealthApprovalAdapter}
          onOpenHealthForm={onOpenHealthForm}
          onExport={onExport}
        />
      )}
    </>
  );
};

export default ParticipantsContent;
