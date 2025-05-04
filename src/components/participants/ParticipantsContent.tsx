
import React from 'react';
import { Product, Registration, Participant, PaymentStatus, HealthDeclaration, Payment } from '@/types';
import ParticipantsSummaryCards from './ParticipantsSummaryCards';
import ParticipantsTable from './ParticipantsTable';
import EmptyParticipantsState from './EmptyParticipantsState';

interface ParticipantsContentProps {
  product: Product | undefined;
  totalParticipants: number;
  registrationsFilled: number;
  totalExpected: number;
  totalPaid: number;
  registrations: Registration[];
  getParticipantForRegistration: (registration: Registration) => Participant | undefined;
  getPaymentsForRegistration: (registrationId: string) => Payment[];
  getHealthDeclarationForRegistration?: (registrationId: string) => HealthDeclaration | undefined;
  calculatePaymentStatus: (registration: Registration) => PaymentStatus;
  getStatusClassName: (status: PaymentStatus) => string;
  onAddPayment: (registration: Registration) => void;
  onDeleteRegistration: (registrationId: string) => void;
  onUpdateHealthApproval: (registrationId: string, isApproved: boolean) => void;
  onOpenHealthForm?: (registrationId: string) => void;
  onPrintHealthDeclaration?: (registrationId: string) => void;
  onExport?: () => void;
  onGenerateReport?: (registrationId: string) => void;
  onPrintReceipt?: (registrationId: string, paymentId: string) => void;
}

const ParticipantsContent: React.FC<ParticipantsContentProps> = ({
  product,
  totalParticipants,
  registrationsFilled,
  totalExpected,
  totalPaid,
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
  onPrintHealthDeclaration,
  onExport,
  onGenerateReport,
  onPrintReceipt,
}) => {
  return (
    <>
      <ParticipantsSummaryCards
        product={product}
        totalParticipants={totalParticipants}
        registrationsFilled={registrationsFilled}
        totalExpected={totalExpected}
        totalPaid={totalPaid}
      />
      
      {registrations.length === 0 ? (
        <EmptyParticipantsState onExport={onExport} />
      ) : (
        <div className="bg-card rounded-lg shadow-card overflow-hidden">
          <ParticipantsTable
            registrations={registrations}
            getParticipantForRegistration={getParticipantForRegistration}
            getPaymentsForRegistration={getPaymentsForRegistration}
            getHealthDeclarationForRegistration={getHealthDeclarationForRegistration}
            calculatePaymentStatus={calculatePaymentStatus}
            getStatusClassName={getStatusClassName}
            onAddPayment={onAddPayment}
            onDeleteRegistration={onDeleteRegistration}
            onUpdateHealthApproval={(participant, isApproved) => {
              if (participant) {
                const registration = registrations.find(r => r.participantId === participant.id);
                if (registration) {
                  onUpdateHealthApproval(registration.id, isApproved);
                }
              }
            }}
            onOpenHealthForm={onOpenHealthForm}
            onPrintHealthDeclaration={onPrintHealthDeclaration}
            onExport={onExport}
            onGenerateReport={onGenerateReport}
            onPrintReceipt={onPrintReceipt}
          />
        </div>
      )}
    </>
  );
};

export default ParticipantsContent;
