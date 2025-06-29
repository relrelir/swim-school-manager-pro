
import React, { useState } from 'react';
import { Participant, Registration, PaymentStatus, Payment, HealthDeclaration } from '@/types';
import ParticipantsSummaryCards from './ParticipantsSummaryCards';
import ParticipantsTable from './ParticipantsTable';
import EmptyParticipantsState from './EmptyParticipantsState';
import EditParticipantDialog from './EditParticipantDialog';

interface ParticipantsContentProps {
  registrations: Registration[];
  totalParticipants: number;
  product: any;
  totalExpected: number;
  totalPaid: number;
  registrationsFilled: number;
  getParticipantForRegistration: (registration: Registration) => Participant | undefined;
  getPaymentsForRegistration: (registrationId: string) => Payment[];
  getHealthDeclarationForRegistration: (registrationId: string) => Promise<HealthDeclaration | undefined>;
  calculatePaymentStatus: (registration: Registration) => PaymentStatus;
  getStatusClassName: (status: string) => string;
  onAddPayment: (registration: Registration) => void;
  onDeleteRegistration: (id: string) => void;
  onUpdateHealthApproval: (registrationId: string, isApproved: boolean) => void;
  onOpenHealthForm: (registrationId: string) => void;
  onUpdateParticipant?: (
    registrationId: string,
    participantData: Partial<Participant>,
    registrationData: Partial<Registration>,
    paymentsData: Payment[]
  ) => void;
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
  onUpdateParticipant,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingRegistration, setEditingRegistration] = useState<Registration | null>(null);
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);
  const [editingPayments, setEditingPayments] = useState<Payment[]>([]);

  // Filter registrations based on search query
  const filteredRegistrations = registrations.filter(registration => {
    const participant = getParticipantForRegistration(registration);
    if (!participant) return false;
    
    const fullName = `${participant.firstName} ${participant.lastName}`.toLowerCase();
    const phone = participant.phone.toLowerCase();
    const idNumber = participant.idNumber.toLowerCase();
    const query = searchQuery.toLowerCase();
    
    return fullName.includes(query) || phone.includes(query) || idNumber.includes(query);
  });

  const handleEditParticipant = (registration: Registration) => {
    const participant = getParticipantForRegistration(registration);
    if (!participant) return;
    
    const payments = getPaymentsForRegistration(registration.id);
    
    setEditingRegistration(registration);
    setEditingParticipant(participant);
    setEditingPayments(payments);
    setIsEditDialogOpen(true);
  };

  const handleSaveParticipant = (
    participantData: Partial<Participant>,
    registrationData: Partial<Registration>,
    paymentsData: Payment[]
  ) => {
    if (onUpdateParticipant && editingRegistration) {
      onUpdateParticipant(editingRegistration.id, participantData, registrationData, paymentsData);
    }
    
    // Reset editing state
    setEditingRegistration(null);
    setEditingParticipant(null);
    setEditingPayments([]);
  };

  // Helper function to get payments for registration (converts registrationId to Registration object)
  const getPaymentsForRegistrationObject = (registration: Registration) => {
    return getPaymentsForRegistration(registration.id);
  };

  if (filteredRegistrations.length === 0 && registrations.length === 0) {
    return <EmptyParticipantsState />;
  }

  return (
    <div className="space-y-6">
      <ParticipantsSummaryCards
        totalParticipants={totalParticipants}
        product={product}
        totalExpected={totalExpected}
        totalPaid={totalPaid}
        registrationsFilled={registrationsFilled}
      />

      <ParticipantsTable
        registrations={filteredRegistrations}
        getParticipantForRegistration={getParticipantForRegistration}
        getPaymentsForRegistration={getPaymentsForRegistrationObject}
        getHealthDeclarationForRegistration={getHealthDeclarationForRegistration}
        calculatePaymentStatus={calculatePaymentStatus}
        getStatusClassName={getStatusClassName}
        onAddPayment={onAddPayment}
        onDeleteRegistration={onDeleteRegistration}
        onUpdateHealthApproval={onUpdateHealthApproval}
        onOpenHealthForm={onOpenHealthForm}
        onEditParticipant={handleEditParticipant}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <EditParticipantDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        registration={editingRegistration}
        participant={editingParticipant}
        payments={editingPayments}
        onSave={handleSaveParticipant}
      />
    </div>
  );
};

export default ParticipantsContent;
