
import React, { useState, useMemo } from 'react';
import { Registration, Participant, Payment, HealthDeclaration, PaymentStatus, PaymentStatusDetails } from '@/types';
import ParticipantsTable from '@/components/participants/ParticipantsTable';
import EmptyParticipantsState from '@/components/participants/EmptyParticipantsState';

interface ParticipantsContentProps {
  registrations: Registration[];
  participants: Participant[];
  product: any;
  totalParticipants: number;
  totalExpected: number;
  totalPaid: number;
  registrationsFilled: number;
  isCalculating: boolean; 
  getParticipantForRegistration: (registration: Registration) => Participant | undefined;
  getPaymentsForRegistration: (registration: Registration | string) => Promise<Payment[]>;
  getHealthDeclarationForRegistration: (registrationId: string) => Promise<HealthDeclaration | undefined>;
  calculatePaymentStatus: (registration: Registration) => PaymentStatusDetails;
  getStatusClassName: (status: string) => string;
  onAddPayment: (registration: Registration) => void;
  onDeleteRegistration: (id: string) => void;
  onUpdateHealthApproval: (registrationId: string, isApproved: boolean) => void;
  onOpenHealthForm: (registrationId: string) => void;
  setIsAddPaymentOpen?: (open: boolean) => void;
  setCurrentRegistration?: (registration: Registration | null) => void;
  setIsHealthFormOpen?: (open: boolean) => void;
  onPaymentTotalsCalculated?: (total: number) => void; // Add this new prop
}

const ParticipantsContent: React.FC<ParticipantsContentProps> = ({
  registrations,
  participants,
  product,
  totalParticipants,
  totalExpected,
  totalPaid,
  registrationsFilled,
  isCalculating,
  getParticipantForRegistration,
  getPaymentsForRegistration,
  getHealthDeclarationForRegistration,
  calculatePaymentStatus,
  getStatusClassName,
  onAddPayment,
  onDeleteRegistration,
  onUpdateHealthApproval,
  onOpenHealthForm,
  onPaymentTotalsCalculated // Add this new prop
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter registrations based on searchQuery
  const filteredRegistrations = useMemo(() => {
    if (!searchQuery.trim()) return registrations;
    
    return registrations.filter(registration => {
      const participant = getParticipantForRegistration(registration);
      if (!participant) return false;
      
      const fullName = `${participant.firstName} ${participant.lastName}`.toLowerCase();
      const idNumber = participant.idNumber?.toLowerCase() || '';
      const phone = participant.phone?.toLowerCase() || '';
      const query = searchQuery.toLowerCase();
      
      return fullName.includes(query) || idNumber.includes(query) || phone.includes(query);
    });
  }, [registrations, searchQuery, getParticipantForRegistration]);

  return (
    <>
      {registrations.length === 0 ? (
        <EmptyParticipantsState />
      ) : (
        <ParticipantsTable
          registrations={filteredRegistrations}
          getParticipantForRegistration={getParticipantForRegistration}
          getPaymentsForRegistration={getPaymentsForRegistration}
          getHealthDeclarationForRegistration={getHealthDeclarationForRegistration}
          calculatePaymentStatus={calculatePaymentStatus}
          getStatusClassName={getStatusClassName}
          onAddPayment={onAddPayment}
          onDeleteRegistration={onDeleteRegistration}
          onUpdateHealthApproval={onUpdateHealthApproval}
          onOpenHealthForm={onOpenHealthForm}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onPaymentTotalsCalculated={onPaymentTotalsCalculated} // Pass the callback
        />
      )}
    </>
  );
};

export default ParticipantsContent;
