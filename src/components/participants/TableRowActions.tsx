
import React from 'react';
import { Button } from '@/components/ui/button';
import { Registration } from '@/types';
import { Printer } from 'lucide-react';

interface TableRowActionsProps {
  registration: Registration;
  hasPayments: boolean;
  onAddPayment: (registration: Registration) => void;
  onDeleteRegistration: (registrationId: string) => void;
  onGenerateReport?: (registrationId: string) => void;
}

const TableRowActions: React.FC<TableRowActionsProps> = ({
  registration,
  hasPayments,
  onAddPayment,
  onDeleteRegistration,
  onGenerateReport
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
      {hasPayments && onGenerateReport && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onGenerateReport(registration.id)}
        >
          <Printer className="h-4 w-4 ml-1" />
          דוח
        </Button>
      )}
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
