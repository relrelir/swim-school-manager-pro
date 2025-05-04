
import React from 'react';
import { Button } from '@/components/ui/button';
import { Registration } from '@/types';

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
  onDeleteRegistration
}) => {
  return (
    <div className="flex space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onAddPayment(registration)}
        className="ml-2"
      >
        הוסף תשלום
      </Button>
      <Button
        variant="destructive"
        size="sm"
        onClick={() => onDeleteRegistration(registration.id)}
        disabled={hasPayments}
      >
        הסר
      </Button>
    </div>
  );
};

export default TableRowActions;
