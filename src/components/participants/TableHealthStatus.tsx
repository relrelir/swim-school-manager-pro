
import React from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Registration, Participant, HealthDeclaration } from '@/types';
import { Printer, Link } from 'lucide-react';

interface TableHealthStatusProps {
  registration: Registration;
  participant: Participant | undefined;
  healthDeclaration?: HealthDeclaration;
  onUpdateHealthApproval: (participant: Participant, isApproved: boolean) => void;
  onOpenHealthForm?: (registrationId: string) => void;
  onPrintHealthDeclaration?: (registrationId: string) => void;
}

const TableHealthStatus: React.FC<TableHealthStatusProps> = ({
  registration,
  participant,
  healthDeclaration,
  onUpdateHealthApproval,
  onOpenHealthForm,
  onPrintHealthDeclaration
}) => {
  if (!onOpenHealthForm) {
    if (!participant) return null;
    
    return (
      <Checkbox 
        checked={participant.healthApproval} 
        onCheckedChange={(checked) => {
          onUpdateHealthApproval(participant, checked === true);
        }}
        className="mx-auto block"
      />
    );
  }
  
  if (!healthDeclaration || healthDeclaration.formStatus === 'pending') {
    return (
      <div className="flex flex-col space-y-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onOpenHealthForm(registration.id)}
          className="w-full"
        >
          <Link className="h-4 w-4 ml-1" />
          יצירת לינק הצהרה
        </Button>
        
        {onPrintHealthDeclaration && participant && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPrintHealthDeclaration(registration.id)}
            className="w-full flex items-center justify-center"
            disabled={!participant}
          >
            <Printer className="h-4 w-4 ml-1" />
            הדפסת טופס
          </Button>
        )}
      </div>
    );
  } else if (healthDeclaration.formStatus === 'sent') {
    return (
      <div className="flex flex-col space-y-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onOpenHealthForm(registration.id)}
          className="w-full bg-yellow-100 hover:bg-yellow-200 border-yellow-300"
        >
          <Link className="h-4 w-4 ml-1" />
          צור לינק מחדש
        </Button>
        
        {onPrintHealthDeclaration && participant && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPrintHealthDeclaration(registration.id)}
            className="w-full flex items-center justify-center"
          >
            <Printer className="h-4 w-4 ml-1" />
            הדפסת טופס
          </Button>
        )}
      </div>
    );
  } else if (healthDeclaration.formStatus === 'signed') {
    if (!participant) return null;
    
    return (
      <div className="flex flex-col space-y-2">
        <Checkbox 
          checked={true}
          disabled
          className="mx-auto block"
        />
        
        {onPrintHealthDeclaration && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPrintHealthDeclaration(registration.id)}
            className="w-full flex items-center justify-center"
          >
            <Printer className="h-4 w-4 ml-1" />
            הדפס הצהרה
          </Button>
        )}
      </div>
    );
  }
  
  return null;
};

export default TableHealthStatus;
