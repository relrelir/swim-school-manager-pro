
import React from 'react';
import { Participant, Registration } from '@/types';
import AddParticipantDialog from '@/components/participants/AddParticipantDialog';
import AddPaymentDialog from '@/components/participants/AddPaymentDialog';

interface ParticipantsDialogsProps {
  isAddParticipantOpen: boolean;
  setIsAddParticipantOpen: (open: boolean) => void;
  isAddPaymentOpen: boolean;
  setIsAddPaymentOpen: (open: boolean) => void;
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
  };
  setNewPayment: React.Dispatch<React.SetStateAction<{
    amount: number;
    receiptNumber: string;
    paymentDate: string;
  }>>;
  handleAddParticipant: (e: React.FormEvent) => void;
  handleAddPayment: (e: React.FormEvent) => void;
  handleApplyDiscount: (amount: number) => void;
}

const ParticipantsDialogs: React.FC<ParticipantsDialogsProps> = ({
  isAddParticipantOpen,
  setIsAddParticipantOpen,
  isAddPaymentOpen,
  setIsAddPaymentOpen,
  newParticipant,
  setNewParticipant,
  registrationData,
  setRegistrationData,
  currentRegistration,
  participants,
  newPayment,
  setNewPayment,
  handleAddParticipant,
  handleAddPayment,
  handleApplyDiscount,
}) => {
  return (
    <>
      {/* Add Participant Dialog */}
      <AddParticipantDialog
        isOpen={isAddParticipantOpen}
        onOpenChange={setIsAddParticipantOpen}
        newParticipant={newParticipant}
        setNewParticipant={setNewParticipant}
        registrationData={registrationData}
        setRegistrationData={setRegistrationData}
        onSubmit={handleAddParticipant}
      />

      {/* Add Payment Dialog */}
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
    </>
  );
};

export default ParticipantsDialogs;
