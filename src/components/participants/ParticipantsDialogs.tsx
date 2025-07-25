
import React from 'react';
import { Participant, Registration, HealthDeclaration } from '@/types';
import AddParticipantDialog from '@/components/participants/AddParticipantDialog';
import AddPaymentDialog from '@/components/participants/AddPaymentDialog';
import HealthDeclarationForm from '@/components/participants/HealthDeclarationForm';

interface ParticipantsDialogsProps {
  isAddParticipantOpen: boolean;
  setIsAddParticipantOpen: (open: boolean) => void;
  isAddPaymentOpen: boolean;
  setIsAddPaymentOpen: (open: boolean) => void;
  isHealthFormOpen: boolean;
  setIsHealthFormOpen: (open: boolean) => void;
  newParticipant: Omit<Participant, 'id'>;
  setNewParticipant: React.Dispatch<React.SetStateAction<Omit<Participant, 'id'>>>;
  registrationData: {
    requiredAmount: number;
    paidAmount: number;
    receiptNumber: string;
    discountApproved: boolean;
  };
  setRegistrationData: React.Dispatch<React.SetStateAction<{
    requiredAmount: number;
    paidAmount: number;
    receiptNumber: string;
    discountApproved: boolean;
  }>>;
  currentRegistration: Registration | null;
  participants: Participant[];
  newPayment: {
    amount: number;
    receiptNumber: string;
    paymentDate: string;
    registrationId?: string;
  };
  setNewPayment: React.Dispatch<React.SetStateAction<{
    amount: number;
    receiptNumber: string;
    paymentDate: string;
    registrationId?: string;
  }>>;
  currentHealthDeclaration: {
    registrationId: string;
    participantName: string;
    phone: string;
    declaration?: HealthDeclaration;
  } | null;
  setCurrentHealthDeclaration: React.Dispatch<React.SetStateAction<{
    registrationId: string;
    participantName: string;
    phone: string;
    declaration?: HealthDeclaration;
  } | null>>;
  handleAddParticipant: (e: React.FormEvent) => void;
  handleAddPayment: (e: React.FormEvent) => void;
  handleApplyDiscount: (amount: number, registrationId?: string) => void;
}

const ParticipantsDialogs: React.FC<ParticipantsDialogsProps> = ({
  isAddParticipantOpen,
  setIsAddParticipantOpen,
  isAddPaymentOpen,
  setIsAddPaymentOpen,
  isHealthFormOpen,
  setIsHealthFormOpen,
  newParticipant,
  setNewParticipant,
  registrationData,
  setRegistrationData,
  currentRegistration,
  participants,
  newPayment,
  setNewPayment,
  currentHealthDeclaration,
  setCurrentHealthDeclaration,
  handleAddParticipant,
  handleAddPayment,
  handleApplyDiscount,
}) => {
  return (
    <>
      {/* Add Participant Dialog */}
      {isAddParticipantOpen && (
        <AddParticipantDialog
          isOpen={isAddParticipantOpen}
          onOpenChange={setIsAddParticipantOpen}
          newParticipant={newParticipant}
          setNewParticipant={setNewParticipant}
          registrationData={registrationData}
          setRegistrationData={setRegistrationData}
          onSubmit={handleAddParticipant}
        />
      )}

      {/* Add Payment Dialog */}
      {isAddPaymentOpen && currentRegistration && (
        <AddPaymentDialog
          isOpen={isAddPaymentOpen}
          onOpenChange={setIsAddPaymentOpen}
          currentRegistration={currentRegistration}
          participants={participants}
          newPayment={newPayment}
          setNewPayment={setNewPayment}
          onSubmit={handleAddPayment}
          onApplyDiscount={handleApplyDiscount}
        />
      )}

      {/* Health Declaration Form */}
      {currentHealthDeclaration && (
        <HealthDeclarationForm
          isOpen={isHealthFormOpen}
          onOpenChange={setIsHealthFormOpen}
          registrationId={currentHealthDeclaration.registrationId}
          participantName={currentHealthDeclaration.participantName}
          defaultPhone={currentHealthDeclaration.phone}
          healthDeclaration={currentHealthDeclaration.declaration}
          afterSubmit={() => {
            // Don't clear the health declaration immediately so user can copy the link
            // if needed, but make sure the dialog can be closed
          }}
        />
      )}
    </>
  );
};

export default ParticipantsDialogs;
