
import React from 'react';
import { Registration } from '@/types';
import PaymentActionButton from './actions/PaymentActionButton';
import RegistrationPdfButton from './actions/RegistrationPdfButton';
import HealthDeclarationButton from './actions/HealthDeclarationButton';
import EditParticipantButton from './actions/EditParticipantButton';
import DeleteRegistrationButton from './actions/DeleteRegistrationButton';

interface TableRowActionsProps {
  registration: Registration;
  hasPayments: boolean;
  onAddPayment: (registration: Registration) => void;
  onDeleteRegistration: (registrationId: string) => void;
  onEditParticipant?: (registration: Registration) => void;
}

const TableRowActions: React.FC<TableRowActionsProps> = ({
  registration,
  hasPayments,
  onAddPayment,
  onDeleteRegistration,
  onEditParticipant,
}) => {
  return (
    <div className="flex gap-2 justify-end">
      <PaymentActionButton 
        registration={registration} 
        onAddPayment={onAddPayment} 
      />
      
      <RegistrationPdfButton 
        registrationId={registration.id} 
      />
      
      <HealthDeclarationButton 
        registration={registration} 
      />
      
      <EditParticipantButton 
        registration={registration} 
        onEditParticipant={onEditParticipant} 
      />
      
      <DeleteRegistrationButton 
        registration={registration} 
        hasPayments={hasPayments} 
        onDeleteRegistration={onDeleteRegistration} 
      />
    </div>
  );
};

export default TableRowActions;
