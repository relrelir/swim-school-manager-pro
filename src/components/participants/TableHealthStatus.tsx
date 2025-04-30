
import React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Participant, Registration, HealthDeclaration } from '@/types';
import HealthFormLink from './health-declaration/HealthFormLink';

interface TableHealthStatusProps {
  registration: Registration;
  participant?: Participant;
  healthDeclaration?: HealthDeclaration;
  onUpdateHealthApproval: (isApproved: boolean) => void;
}

const TableHealthStatus: React.FC<TableHealthStatusProps> = ({
  registration,
  participant,
  healthDeclaration,
  onUpdateHealthApproval
}) => {
  if (!participant) return null;

  const isFormSigned = healthDeclaration && healthDeclaration.formStatus === 'signed';

  return (
    <div className="flex items-center gap-2">
      {participant.healthApproval ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <CheckCircle className="h-5 w-5 text-green-500" />
          </TooltipTrigger>
          <TooltipContent>
            אישור בריאות התקבל
          </TooltipContent>
        </Tooltip>
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            <AlertCircle className="h-5 w-5 text-amber-500" />
          </TooltipTrigger>
          <TooltipContent>
            אישור בריאות חסר
          </TooltipContent>
        </Tooltip>
      )}
      
      <HealthFormLink 
        registrationId={registration.id} 
        isDisabled={isFormSigned || false} 
      />

      <Button
        variant="ghost"
        size="sm"
        className={cn(
          participant.healthApproval ? "text-red-500 hover:text-red-600" : "text-green-500 hover:text-green-600"
        )}
        onClick={() => onUpdateHealthApproval(!participant.healthApproval)}
      >
        {participant.healthApproval ? 'בטל אישור' : 'סמן כמאושר'}
      </Button>
    </div>
  );
};

export default TableHealthStatus;
