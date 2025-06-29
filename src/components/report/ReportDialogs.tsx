
import React from 'react';
import ParticipantsDialogs from '@/components/participants/ParticipantsDialogs';
import { Registration, Participant, Payment } from '@/types';

interface ReportDialogsProps {
  isAddPaymentOpen: boolean;
  setIsAddPaymentOpen: (open: boolean) => void;
  isEditDialogOpen: boolean;
  setIsEditDialogOpen: (open: boolean) => void;
  currentRegistration: Registration | null;
  editingRegistration: Registration | null;
  editingParticipant: Participant | null;
  editingPayments: Payment[];
  newPayment: {
    amount: number;
    receiptNumber: string;
    paymentDate: string;
  };
  setNewPayment: (payment: {
    amount: number;
    receiptNumber: string;
    paymentDate: string;
  }) => void;
  participants: Participant[];
  onSaveParticipant: (
    participantData: Partial<Participant>,
    registrationData: Partial<Registration>,
    paymentsData: Payment[]
  ) => void;
  onAddPayment: () => Promise<void>;
}

const ReportDialogs: React.FC<ReportDialogsProps> = ({
  isAddPaymentOpen,
  setIsAddPaymentOpen,
  isEditDialogOpen,
  setIsEditDialogOpen,
  currentRegistration,
  editingRegistration,
  editingParticipant,
  editingPayments,
  newPayment,
  setNewPayment,
  participants,
  onSaveParticipant,
  onAddPayment,
}) => {
  return (
    <ParticipantsDialogs
      isAddParticipantOpen={false}
      setIsAddParticipantOpen={() => {}}
      isAddPaymentOpen={isAddPaymentOpen}
      setIsAddPaymentOpen={setIsAddPaymentOpen}
      isHealthFormOpen={false}
      setIsHealthFormOpen={() => {}}
      newParticipant={{
        firstName: '',
        lastName: '',
        phone: '',
        idNumber: '',
        healthApproval: false,
      }}
      setNewParticipant={() => {}}
      registrationData={{
        requiredAmount: 0,
        discountAmount: 0,
        discountApproved: false,
      }}
      setRegistrationData={() => {}}
      currentRegistration={currentRegistration}
      participants={participants}
      newPayment={newPayment}
      setNewPayment={setNewPayment}
      currentHealthDeclaration={null}
      setCurrentHealthDeclaration={() => {}}
      handleAddParticipant={async () => {}}
      handleAddPayment={onAddPayment}
      handleApplyDiscount={async () => {}}
      editingRegistration={editingRegistration}
      editingParticipant={editingParticipant}
      editingPayments={editingPayments}
      onSaveParticipant={onSaveParticipant}
      isEditDialogOpen={isEditDialogOpen}
      setIsEditDialogOpen={setIsEditDialogOpen}
    />
  );
};

export default ReportDialogs;
