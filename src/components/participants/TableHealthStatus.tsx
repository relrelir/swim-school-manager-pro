
import React from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Registration, Participant, HealthDeclaration } from '@/types';

interface TableHealthStatusProps {
  registration: Registration;
  participant: Participant | undefined;
  healthDeclaration?: HealthDeclaration;
  onUpdateHealthApproval: (participant: Participant, isApproved: boolean) => void;
  onOpenHealthForm?: (registrationId: string) => void;
}

const TableHealthStatus: React.FC<TableHealthStatusProps> = ({
  registration,
  participant,
  healthDeclaration,
  onUpdateHealthApproval,
  onOpenHealthForm
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
      <Button
        variant="outline"
        size="sm"
        onClick={() => onOpenHealthForm(registration.id)}
        className="w-full"
      >
        צור קישור להצהרה
      </Button>
    );
  } else if (healthDeclaration.formStatus === 'sent') {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => onOpenHealthForm(registration.id)}
        className="w-full bg-yellow-100 hover:bg-yellow-200 border-yellow-300"
      >
        צור קישור מחדש
      </Button>
    );
  } else if (healthDeclaration.formStatus === 'signed') {
    if (!participant) return null;
    
    return (
      <Checkbox 
        checked={true}
        disabled
        className="mx-auto block"
      />
    );
  }
  
  return null;
};

export default TableHealthStatus;
