
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Participant } from '@/types';

interface TableHealthStatusProps {
  participant: Participant | undefined;
  onUpdateHealthApproval: (participant: Participant, isApproved: boolean) => void;
}

const TableHealthStatus: React.FC<TableHealthStatusProps> = ({
  participant,
  onUpdateHealthApproval
}) => {
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
};

export default TableHealthStatus;
