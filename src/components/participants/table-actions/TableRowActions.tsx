
import React from 'react';
import { Registration } from '@/types';
import AddPaymentButton from './AddPaymentButton';
import RegistrationPdfButton from './RegistrationPdfButton';
import HealthDeclarationButton from './HealthDeclarationButton';
import DeleteRegistrationButton from './DeleteRegistrationButton';

interface TableRowActionsProps {
  registration: Registration;
  hasPayments: boolean;
  onAddPayment: (registration: Registration) => void;
  onDeleteRegistration: (registrationId: string) => void;
}

const TableRowActions: React.FC<TableRowActionsProps> = ({
  registration,
  hasPayments,
  onAddPayment,
  onDeleteRegistration,
}) => {
  return (
    <div className="flex gap-2 justify-end">
      {/* Payment Button */}
      <AddPaymentButton 
        registration={registration} 
        onAddPayment={onAddPayment} 
      />
      
      {/* Registration PDF Button */}
      <RegistrationPdfButton 
        registrationId={registration.id} 
      />
      
      {/* Health Declaration Button */}
      <HealthDeclarationButton 
        registrationId={registration.id} 
        participantId={registration.participantId} 
      />
      
      {/* Delete Registration Button */}
      <DeleteRegistrationButton 
        registrationId={registration.id} 
        hasPayments={hasPayments} 
        onDeleteRegistration={onDeleteRegistration} 
      />
    </div>
  );
};

export default TableRowActions;
