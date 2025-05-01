
import React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { CheckCircle, AlertCircle, FileText, Link as LinkIcon, Printer } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Participant, Registration, HealthDeclaration } from '@/types';
import HealthFormLink from './health-declaration/HealthFormLink';

interface TableHealthStatusProps {
  registration: Registration;
  participant?: Participant;
  healthDeclaration?: HealthDeclaration;
  onUpdateHealthApproval: (isApproved: boolean) => void;
  onOpenHealthForm?: () => void;
}

const TableHealthStatus: React.FC<TableHealthStatusProps> = ({
  registration,
  participant,
  healthDeclaration,
  onOpenHealthForm
}) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = React.useState(false);

  if (!participant) return null;

  // Check if the form is signed (completed)
  const isFormSigned = Boolean(
    healthDeclaration && 
    (healthDeclaration.formStatus === 'signed' || healthDeclaration.form_status === 'signed')
  );
  
  console.log("Health declaration status:", {
    registrationId: registration.id,
    hasDeclaration: Boolean(healthDeclaration),
    formStatus: healthDeclaration?.formStatus || healthDeclaration?.form_status,
    isFormSigned
  });
  
  // Open the printable health declaration page in a new tab
  const handleOpenPrintablePage = () => {
    if (!healthDeclaration) {
      console.error("Cannot open printable page: Health declaration is missing");
      return;
    }
    
    const url = `/printable-health-declaration?id=${healthDeclaration.id}`;
    console.log("Opening printable health declaration:", url, "Health declaration:", healthDeclaration);
    window.open(url, '_blank');
  };

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
      
      {isFormSigned ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-blue-500 hover:text-blue-600"
              onClick={handleOpenPrintablePage}
              disabled={isGeneratingPdf}
            >
              <Printer className="h-4 w-4 mr-1" />
              הדפס הצהרה
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            הדפס הצהרת בריאות
          </TooltipContent>
        </Tooltip>
      ) : (
        <HealthFormLink 
          registrationId={registration.id} 
          isDisabled={isFormSigned} 
          declarationId={healthDeclaration?.id}
        />
      )}
    </div>
  );
};

export default TableHealthStatus;
