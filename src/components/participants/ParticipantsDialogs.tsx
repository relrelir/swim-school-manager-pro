
import React from 'react';
import AddParticipantDialog from './AddParticipantDialog';
import AddPaymentDialog from './AddPaymentDialog';
import HealthDeclarationForm from './HealthDeclarationForm';
import EditParticipantDialog from './EditParticipantDialog';
import { Participant, Registration, Payment, HealthDeclaration } from '@/types';

interface ParticipantsDialogsProps {
  isAddParticipantOpen: boolean;
  setIsAddParticipantOpen: (open: boolean) => void;
  isAddPaymentOpen: boolean;
  setIsAddPaymentOpen: (open: boolean) => void;
  isHealthFormOpen: boolean;
  setIsHealthFormOpen: (open: boolean) => void;
  newParticipant: Partial<Participant>;
  setNewParticipant: (participant: Partial<Participant>) => void;
  registrationData: Partial<Registration>;
  setRegistrationData: (data: Partial<Registration>) => void;
  currentRegistration: Registration | null;
  participants: Participant[];
  newPayment: any;
  setNewPayment: (payment: any) => void;
  currentHealthDeclaration: HealthDeclaration | null;
  setCurrentHealthDeclaration: (declaration: HealthDeclaration | null) => void;
  handleAddParticipant: () => Promise<void>;
  handleAddPayment: () => Promise<void>;
  handleApplyDiscount: (amount: number, registrationId?: string) => Promise<void>;
  // Optional props for edit dialog
  editingRegistration?: Registration | null;
  editingParticipant?: Participant | null;
  editingPayments?: Payment[];
  onSaveParticipant?: (
    participantData: Partial<Participant>,
    registrationData: Partial<Registration>,
    paymentsData: Payment[]
  ) => void;
  isEditDialogOpen?: boolean;
  setIsEditDialogOpen?: (open: boolean) => void;
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
  editingRegistration,
  editingParticipant,
  editingPayments = [],
  onSaveParticipant,
  isEditDialogOpen = false,
  setIsEditDialogOpen,
}) => {
  return (
    <>
      <AddParticipantDialog
        isOpen={isAddParticipantOpen}
        onOpenChange={setIsAddParticipantOpen}
        newParticipant={newParticipant}
        setNewParticipant={setNewParticipant}
        registrationData={registrationData}
        setRegistrationData={setRegistrationData}
        participants={participants}
        onAddParticipant={handleAddParticipant}
      />

      <AddPaymentDialog
        isOpen={isAddPaymentOpen}
        onOpenChange={setIsAddPaymentOpen}
        currentRegistration={currentRegistration}
        newPayment={newPayment}
        setNewPayment={setNewPayment}
        onAddPayment={handleAddPayment}
        onApplyDiscount={handleApplyDiscount}
      />

      <HealthDeclarationForm
        isOpen={isHealthFormOpen}
        onOpenChange={setIsHealthFormOpen}
        healthDeclaration={currentHealthDeclaration}
        setHealthDeclaration={setCurrentHealthDeclaration}
      />

      {/* Edit Participant Dialog - only render if props are provided */}
      {setIsEditDialogOpen && onSaveParticipant && (
        <EditParticipantDialog
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          registration={editingRegistration}
          participant={editingParticipant}
          payments={editingPayments}
          onSave={onSaveParticipant}
        />
      )}
    </>
  );
};

export default ParticipantsDialogs;
